import React, { useState, useEffect } from "react";
import { HardDrive, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

interface MemoryInfo {
  used: number;
  total: number;
  percentage: number;
  isHigh: boolean;
}

interface MemoryMonitorProps {
  isProcessing: boolean;
  onMemoryWarning?: () => void;
}

export function MemoryMonitor({
  isProcessing,
  onMemoryWarning,
}: MemoryMonitorProps) {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo>({
    used: 0,
    total: 0,
    percentage: 0,
    isHigh: false,
  });
  const [lastCleanup, setLastCleanup] = useState<Date | null>(null);
  const [cleanupCount, setCleanupCount] = useState(0);

  const getMemoryInfo = (): MemoryInfo => {
    if ("memory" in performance) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize;
      const total = memory.totalJSHeapSize;
      const percentage = used / total;

      return {
        used: Math.round(used / 1024 / 1024), // MB
        total: Math.round(total / 1024 / 1024), // MB
        percentage,
        isHigh: percentage > 0.8,
      };
    }

    return {
      used: 0,
      total: 0,
      percentage: 0,
      isHigh: false,
    };
  };

  const forceGarbageCollection = () => {
    if ("gc" in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).gc();
        setLastCleanup(new Date());
        setCleanupCount((prev) => prev + 1);
        console.log("Manual garbage collection triggered");
      } catch (error) {
        console.warn("Failed to force garbage collection:", error);
      }
    }
  };

  useEffect(() => {
    const updateMemoryInfo = () => {
      const info = getMemoryInfo();
      setMemoryInfo(info);

      // 如果内存使用过高，触发警告
      if (info.isHigh && onMemoryWarning) {
        onMemoryWarning();
      }
    };

    // 初始更新
    updateMemoryInfo();

    // 每秒更新一次内存信息
    const interval = setInterval(updateMemoryInfo, 1000);

    return () => clearInterval(interval);
  }, [onMemoryWarning]);

  const getMemoryColor = () => {
    if (memoryInfo.percentage > 0.9) return "text-red-600";
    if (memoryInfo.percentage > 0.8) return "text-orange-600";
    if (memoryInfo.percentage > 0.6) return "text-yellow-600";
    return "text-green-600";
  };

  const getMemoryStatus = () => {
    if (memoryInfo.percentage > 0.9) return "危险";
    if (memoryInfo.percentage > 0.8) return "警告";
    if (memoryInfo.percentage > 0.6) return "注意";
    return "正常";
  };

  const getMemoryIcon = () => {
    if (memoryInfo.percentage > 0.8)
      return <AlertTriangle className="w-4 h-4" />;
    return <HardDrive className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">内存监控</h3>
        <button
          onClick={forceGarbageCollection}
          className="p-1 hover:bg-gray-100 rounded"
          title="强制垃圾回收"
        >
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="space-y-3">
        {/* 内存使用情况 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={getMemoryColor()}>{getMemoryIcon()}</div>
            <span className="text-sm text-gray-700">内存使用</span>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${getMemoryColor()}`}>
              {memoryInfo.used} MB / {memoryInfo.total} MB
            </div>
            <div className="text-xs text-gray-500">
              {Math.round(memoryInfo.percentage * 100)}% - {getMemoryStatus()}
            </div>
          </div>
        </div>

        {/* 内存使用进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              memoryInfo.percentage > 0.9
                ? "bg-red-500"
                : memoryInfo.percentage > 0.8
                ? "bg-orange-500"
                : memoryInfo.percentage > 0.6
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${Math.min(memoryInfo.percentage * 100, 100)}%` }}
          />
        </div>

        {/* 清理状态 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">清理状态</span>
          <div className="flex items-center space-x-2">
            {lastCleanup ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">
                  {lastCleanup.toLocaleTimeString()}
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400">未清理</span>
            )}
          </div>
        </div>

        {/* 清理次数 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">清理次数</span>
          <span className="text-sm font-medium text-gray-900">
            {cleanupCount}
          </span>
        </div>

        {/* 处理状态 */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span className="text-xs text-blue-800">
                处理中 - 自动内存清理已启用
              </span>
            </div>
          </div>
        )}

        {/* 内存警告 */}
        {memoryInfo.isHigh && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
              <div className="text-xs text-red-800">
                <div className="font-medium mb-1">内存使用过高</div>
                <div>建议手动触发垃圾回收或暂停处理</div>
              </div>
            </div>
          </div>
        )}

        {/* 性能建议 */}
        {memoryInfo.percentage > 0.6 && memoryInfo.percentage <= 0.8 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <div className="font-medium mb-1">内存使用较高</div>
                <div>系统正在自动清理，请耐心等待</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
