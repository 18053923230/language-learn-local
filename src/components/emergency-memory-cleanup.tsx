import React, { useState } from "react";
import { Zap, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmergencyMemoryCleanupProps {
  onCleanup?: () => Promise<void>;
  isProcessing?: boolean;
}

export function EmergencyMemoryCleanup({
  onCleanup,
  isProcessing = false,
}: EmergencyMemoryCleanupProps) {
  const [isCleaning, setIsCleaning] = useState(false);
  const [lastCleanup, setLastCleanup] = useState<Date | null>(null);
  const [cleanupCount, setCleanupCount] = useState(0);

  const handleEmergencyCleanup = async () => {
    setIsCleaning(true);

    try {
      console.log("🚨 Emergency memory cleanup triggered!");

      // 1. 强制垃圾回收
      if ("gc" in window) {
        for (let i = 0; i < 5; i++) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).gc();
            console.log(`Emergency GC ${i + 1}/5`);
            await new Promise((resolve) => setTimeout(resolve, 200));
          } catch (error) {
            console.warn("Failed to force garbage collection:", error);
          }
        }
      }

      // 2. 清理可能的 URL 对象
      try {
        // 尝试清理一些常见的 URL 对象
        const elements = document.querySelectorAll('a[href^="blob:"]');
        elements.forEach((element) => {
          const href = element.getAttribute("href");
          if (href && href.startsWith("blob:")) {
            URL.revokeObjectURL(href);
          }
        });
        console.log("Cleaned blob URLs");
      } catch (error) {
        console.warn("Error cleaning blob URLs:", error);
      }

      // 3. 长时间暂停让浏览器回收内存
      console.log("⏳ Emergency memory cleanup waiting...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 4. 调用外部清理函数（如果有的话）
      if (onCleanup) {
        await onCleanup();
      }

      // 5. 再次强制垃圾回收
      if ("gc" in window) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).gc();
          console.log("Final emergency GC");
        } catch (error) {
          console.warn("Failed final garbage collection:", error);
        }
      }

      setLastCleanup(new Date());
      setCleanupCount((prev) => prev + 1);

      console.log("✅ Emergency memory cleanup completed!");
    } catch (error) {
      console.error("❌ Emergency memory cleanup failed:", error);
    } finally {
      setIsCleaning(false);
    }
  };

  const getMemoryStatus = () => {
    if ("memory" in performance) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const memory = (performance as any).memory;
      const percentage = memory.usedJSHeapSize / memory.totalJSHeapSize;

      if (percentage > 0.9) return "危险";
      if (percentage > 0.8) return "警告";
      if (percentage > 0.6) return "注意";
      return "正常";
    }
    return "未知";
  };

  const getMemoryPercentage = () => {
    if ("memory" in performance) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const memory = (performance as any).memory;
      return Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100);
    }
    return 0;
  };

  const memoryStatus = getMemoryStatus();
  const memoryPercentage = getMemoryPercentage();

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-sm font-semibold text-red-900">紧急内存清理</h3>
        </div>
        <div className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
          {memoryStatus} ({memoryPercentage}%)
        </div>
      </div>

      <div className="space-y-3">
        {/* 内存使用进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              memoryPercentage > 90
                ? "bg-red-500"
                : memoryPercentage > 80
                ? "bg-orange-500"
                : memoryPercentage > 60
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${Math.min(memoryPercentage, 100)}%` }}
          />
        </div>

        {/* 清理按钮 */}
        <Button
          onClick={handleEmergencyCleanup}
          disabled={isCleaning || isProcessing}
          className={`w-full ${
            memoryPercentage > 80
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-orange-600 hover:bg-orange-700 text-white"
          }`}
          size="sm"
        >
          {isCleaning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              紧急清理中...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              一键清内存
            </>
          )}
        </Button>

        {/* 状态信息 */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">清理次数:</span>
            <span className="font-medium">{cleanupCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">最后清理:</span>
            <span className="text-gray-500">
              {lastCleanup ? lastCleanup.toLocaleTimeString() : "未清理"}
            </span>
          </div>
        </div>

        {/* 警告信息 */}
        {memoryPercentage > 80 && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
              <div className="text-xs text-red-800">
                <div className="font-medium mb-1">内存使用过高！</div>
                <div>建议立即执行紧急清理，或刷新页面重新开始。</div>
              </div>
            </div>
          </div>
        )}

        {/* 成功信息 */}
        {lastCleanup && memoryPercentage < 60 && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-xs text-green-800">
                <div className="font-medium mb-1">清理成功！</div>
                <div>内存使用已降至安全水平。</div>
              </div>
            </div>
          </div>
        )}

        {/* 处理状态 */}
        {isProcessing && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span className="text-xs text-blue-800">
                处理中 - 系统正在自动清理内存
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
