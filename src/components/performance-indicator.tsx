import React from "react";
import { Zap, Clock, HardDrive, AlertTriangle } from "lucide-react";

interface PerformanceIndicatorProps {
  mode: "copy" | "encode";
  speed: "fast" | "medium" | "slow";
  memoryUsage: number;
  isProcessing: boolean;
}

export function PerformanceIndicator({
  mode,
  speed,
  memoryUsage,
  isProcessing,
}: PerformanceIndicatorProps) {
  const getModeIcon = () => {
    return mode === "copy" ? (
      <Zap className="w-4 h-4" />
    ) : (
      <HardDrive className="w-4 h-4" />
    );
  };

  const getModeColor = () => {
    return mode === "copy" ? "text-green-600" : "text-blue-600";
  };

  const getSpeedColor = () => {
    switch (speed) {
      case "fast":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "slow":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getMemoryColor = () => {
    if (memoryUsage < 50) return "text-green-600";
    if (memoryUsage < 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getModeDescription = () => {
    return mode === "copy"
      ? "Fast Copy Mode (无损复制)"
      : "Encode Mode (重新编码)";
  };

  const getSpeedDescription = () => {
    switch (speed) {
      case "fast":
        return "极快 (10-100x)";
      case "medium":
        return "中等 (1-10x)";
      case "slow":
        return "较慢 (<1x)";
      default:
        return "未知";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">性能监控</h3>
        {isProcessing && (
          <div className="flex items-center space-x-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span className="text-xs text-blue-600">处理中</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* 处理模式 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`${getModeColor()}`}>{getModeIcon()}</div>
            <span className="text-sm text-gray-700">处理模式</span>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${getModeColor()}`}>
              {mode === "copy" ? "Copy" : "Encode"}
            </div>
            <div className="text-xs text-gray-500">{getModeDescription()}</div>
          </div>
        </div>

        {/* 处理速度 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className={`w-4 h-4 ${getSpeedColor()}`} />
            <span className="text-sm text-gray-700">处理速度</span>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${getSpeedColor()}`}>
              {speed === "fast" ? "极快" : speed === "medium" ? "中等" : "较慢"}
            </div>
            <div className="text-xs text-gray-500">{getSpeedDescription()}</div>
          </div>
        </div>

        {/* 内存使用 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HardDrive className={`w-4 h-4 ${getMemoryColor()}`} />
            <span className="text-sm text-gray-700">内存使用</span>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${getMemoryColor()}`}>
              {memoryUsage}%
            </div>
            <div className="text-xs text-gray-500">
              {memoryUsage < 50 ? "正常" : memoryUsage < 80 ? "注意" : "警告"}
            </div>
          </div>
        </div>

        {/* 性能建议 */}
        {mode === "encode" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <div className="font-medium mb-1">性能建议</div>
                <div>
                  当前使用编码模式，速度较慢。建议使用 MP4 格式以获得更快的 copy
                  模式。
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === "copy" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Zap className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-xs text-green-800">
                <div className="font-medium mb-1">性能优化</div>
                <div>当前使用快速复制模式，速度极快且质量无损！</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
