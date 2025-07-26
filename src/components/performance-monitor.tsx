"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Cpu,
  HardDrive,
  Memory,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

export interface PerformanceMetrics {
  memory: {
    used: number;
    total: number;
    limit: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  storage: {
    used: number;
    total: number;
  };
  fps: number;
  loadTime: number;
  errors: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [history, setHistory] = useState<PerformanceMetrics[]>([]);
  const [errorCount, setErrorCount] = useState(0);

  // 获取内存使用情况
  const getMemoryInfo = useCallback(async (): Promise<
    PerformanceMetrics["memory"]
  > => {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }

    // 降级方案：使用 navigator.deviceMemory
    if ("deviceMemory" in navigator) {
      const deviceMemory = (navigator as any).deviceMemory * 1024 * 1024 * 1024; // GB to bytes
      return {
        used: 0, // 无法获取精确值
        total: deviceMemory,
        limit: deviceMemory,
      };
    }

    return {
      used: 0,
      total: 0,
      limit: 0,
    };
  }, []);

  // 获取CPU信息
  const getCpuInfo = useCallback((): PerformanceMetrics["cpu"] => {
    if ("hardwareConcurrency" in navigator) {
      return {
        usage: 0, // 浏览器无法直接获取CPU使用率
        cores: navigator.hardwareConcurrency,
      };
    }

    return {
      usage: 0,
      cores: 1,
    };
  }, []);

  // 获取存储信息
  const getStorageInfo = useCallback(async (): Promise<
    PerformanceMetrics["storage"]
  > => {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        total: estimate.quota || 0,
      };
    }

    return {
      used: 0,
      total: 0,
    };
  }, []);

  // 计算FPS
  const calculateFPS = useCallback((): number => {
    let frameCount = 0;
    let lastTime = performance.now();

    const countFrames = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        return fps;
      }

      requestAnimationFrame(countFrames);
    };

    requestAnimationFrame(countFrames);
    return 60; // 默认值
  }, []);

  // 收集性能指标
  const collectMetrics = useCallback(async (): Promise<PerformanceMetrics> => {
    const startTime = performance.now();

    const memory = await getMemoryInfo();
    const cpu = getCpuInfo();
    const storage = await getStorageInfo();
    const fps = calculateFPS();

    const loadTime = performance.now() - startTime;

    return {
      memory,
      cpu,
      storage,
      fps,
      loadTime,
      errors: errorCount,
    };
  }, [getMemoryInfo, getCpuInfo, getStorageInfo, calculateFPS, errorCount]);

  // 开始监控
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    setHistory([]);

    const monitorInterval = setInterval(async () => {
      try {
        const currentMetrics = await collectMetrics();
        setMetrics(currentMetrics);
        setHistory((prev) => [...prev.slice(-9), currentMetrics]); // 保留最近10个数据点
      } catch (error) {
        console.error("Failed to collect metrics:", error);
        setErrorCount((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(monitorInterval);
  }, [collectMetrics]);

  // 停止监控
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // 格式化字节数
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // 格式化百分比
  const formatPercentage = (value: number, total: number): string => {
    if (total === 0) return "0%";
    return ((value / total) * 100).toFixed(1) + "%";
  };

  // 获取性能状态
  const getPerformanceStatus = (): "good" | "warning" | "poor" => {
    if (!metrics) return "good";

    if (
      metrics.memory.used > metrics.memory.limit * 0.8 ||
      metrics.fps < 30 ||
      metrics.loadTime > 1000
    ) {
      return "poor";
    }

    if (
      metrics.memory.used > metrics.memory.limit * 0.6 ||
      metrics.fps < 50 ||
      metrics.loadTime > 500
    ) {
      return "warning";
    }

    return "good";
  };

  // 错误监听
  useEffect(() => {
    const handleError = () => setErrorCount((prev) => prev + 1);
    const handleUnhandledRejection = () => setErrorCount((prev) => prev + 1);

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  const status = getPerformanceStatus();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Performance Monitor
        </h3>
        <div className="flex items-center space-x-2">
          {!isMonitoring ? (
            <Button onClick={startMonitoring} size="sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              Start Monitoring
            </Button>
          ) : (
            <Button onClick={stopMonitoring} variant="outline" size="sm">
              <TrendingDown className="w-4 h-4 mr-1" />
              Stop Monitoring
            </Button>
          )}
        </div>
      </div>

      {/* Performance Status */}
      <div
        className={`p-3 rounded-lg border ${
          status === "good"
            ? "bg-green-50 border-green-200"
            : status === "warning"
            ? "bg-yellow-50 border-yellow-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex items-center space-x-2">
          {status === "good" ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : status === "warning" ? (
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
          <span
            className={`font-medium ${
              status === "good"
                ? "text-green-800"
                : status === "warning"
                ? "text-yellow-800"
                : "text-red-800"
            }`}
          >
            Performance: {status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Memory Usage */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Memory className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Memory</span>
            </div>
            <div className="space-y-1 text-sm">
              <div>Used: {formatBytes(metrics.memory.used)}</div>
              <div>Total: {formatBytes(metrics.memory.total)}</div>
              <div>Limit: {formatBytes(metrics.memory.limit)}</div>
              <div className="text-blue-600">
                {formatPercentage(metrics.memory.used, metrics.memory.limit)}{" "}
                used
              </div>
            </div>
          </div>

          {/* CPU Info */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Cpu className="w-4 h-4 text-green-600" />
              <span className="font-medium">CPU</span>
            </div>
            <div className="space-y-1 text-sm">
              <div>Cores: {metrics.cpu.cores}</div>
              <div>Usage: {metrics.cpu.usage}%</div>
            </div>
          </div>

          {/* Storage */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <HardDrive className="w-4 h-4 text-purple-600" />
              <span className="font-medium">Storage</span>
            </div>
            <div className="space-y-1 text-sm">
              <div>Used: {formatBytes(metrics.storage.used)}</div>
              <div>Total: {formatBytes(metrics.storage.total)}</div>
              <div className="text-purple-600">
                {formatPercentage(metrics.storage.used, metrics.storage.total)}{" "}
                used
              </div>
            </div>
          </div>

          {/* FPS */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <RefreshCw className="w-4 h-4 text-orange-600" />
              <span className="font-medium">Performance</span>
            </div>
            <div className="space-y-1 text-sm">
              <div>FPS: {metrics.fps}</div>
              <div>Load Time: {metrics.loadTime.toFixed(2)}ms</div>
              <div>Errors: {metrics.errors}</div>
            </div>
          </div>
        </div>
      )}

      {/* Performance History Chart */}
      {history.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-medium mb-3">Performance History</h4>
          <div className="h-32 flex items-end space-x-1">
            {history.map((metric, index) => (
              <div
                key={index}
                className="flex-1 bg-blue-200 rounded-t"
                style={{
                  height: `${(metric.fps / 60) * 100}%`,
                  minHeight: "4px",
                }}
              ></div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            FPS over time (last {history.length} seconds)
          </div>
        </div>
      )}

      {/* Performance Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Performance Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Close unused browser tabs to free up memory</li>
          <li>• Use hardware acceleration when available</li>
          <li>• Keep video files under 100MB for optimal performance</li>
          <li>• Regularly clear browser cache and storage</li>
        </ul>
      </div>
    </div>
  );
}
