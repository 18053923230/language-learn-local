"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Cpu,
  MemoryStick,
  Monitor,
  Zap,
  Settings,
  RefreshCw,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  videoPerformanceOptimizer,
  PerformanceInfo,
  OptimizationRecommendations,
} from "@/lib/video-performance-optimizer";
import { toast } from "sonner";
import Link from "next/link";

export default function PerformanceMonitorPage() {
  const [performanceInfo, setPerformanceInfo] =
    useState<PerformanceInfo | null>(null);
  const [recommendations, setRecommendations] =
    useState<OptimizationRecommendations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    loadPerformanceInfo();
  }, []);

  const loadPerformanceInfo = async () => {
    try {
      setIsLoading(true);
      const info = await videoPerformanceOptimizer.detectPerformanceInfo();
      const recs = videoPerformanceOptimizer.getOptimizationRecommendations();

      setPerformanceInfo(info);
      setRecommendations(recs);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading performance info:", error);
      toast.error("Failed to load performance information");
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceScore = (): number => {
    if (!performanceInfo) return 0;

    let score = 0;

    // CPU 评分
    if (performanceInfo.cpuCores >= 8) score += 30;
    else if (performanceInfo.cpuCores >= 4) score += 20;
    else if (performanceInfo.cpuCores >= 2) score += 10;

    // 内存评分
    if (performanceInfo.memoryGB >= 8) score += 25;
    else if (performanceInfo.memoryGB >= 4) score += 15;
    else if (performanceInfo.memoryGB >= 2) score += 10;

    // 硬件加速评分
    if (performanceInfo.hasWebGL2) score += 20;
    else if (performanceInfo.hasWebGL) score += 10;

    if (performanceInfo.hasWebCodecs) score += 15;
    if (performanceInfo.hasSharedArrayBuffer) score += 10;

    return Math.min(score, 100);
  };

  const getPerformanceLevel = (
    score: number
  ): {
    level: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  } => {
    if (score >= 80)
      return { level: "优秀", color: "text-green-600", icon: CheckCircle };
    if (score >= 60)
      return { level: "良好", color: "text-blue-600", icon: CheckCircle };
    if (score >= 40)
      return { level: "一般", color: "text-yellow-600", icon: AlertTriangle };
    return { level: "较低", color: "text-red-600", icon: AlertTriangle };
  };

  const formatMemory = (gb: number): string => {
    return `${gb}GB`;
  };

  const getOptimizationStatus = (
    enabled: boolean
  ): { text: string; color: string } => {
    return enabled
      ? { text: "已启用", color: "text-green-600" }
      : { text: "未启用", color: "text-gray-500" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">正在检测系统性能...</p>
          </div>
        </div>
      </div>
    );
  }

  const performanceScore = getPerformanceScore();
  const performanceLevel = getPerformanceLevel(performanceScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                性能监控
              </h1>
              <p className="text-gray-600 mt-2">系统性能检测和优化建议</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={loadPerformanceInfo}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                刷新
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Monitor className="w-4 h-4 mr-2" />
                  返回主页
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 性能评分 */}
        <div className="education-card p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">系统性能评分</h2>
            {lastUpdate && (
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                最后更新: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${performanceLevel.color}`}
                  >
                    {performanceScore}
                  </div>
                  <div className="text-sm text-gray-600">分</div>
                </div>
              </div>
              <div
                className={`absolute -top-2 -right-2 p-2 rounded-full bg-white shadow-lg ${performanceLevel.color}`}
              >
                <performanceLevel.icon className="w-6 h-6" />
              </div>
            </div>
            <div
              className={`mt-4 text-xl font-semibold ${performanceLevel.color}`}
            >
              {performanceLevel.level}
            </div>
            <p className="text-gray-600 mt-2">
              基于您的硬件配置和浏览器支持情况
            </p>
          </div>
        </div>

        {/* 硬件信息 */}
        {performanceInfo && (
          <div className="education-card p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">硬件信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Cpu className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      CPU 核心数
                    </div>
                    <div className="text-gray-600">
                      {performanceInfo.cpuCores} 核心
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <MemoryStick className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-semibold text-gray-900">可用内存</div>
                    <div className="text-gray-600">
                      {formatMemory(performanceInfo.memoryGB)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Monitor className="w-6 h-6 text-purple-600" />
                  <div>
                    <div className="font-semibold text-gray-900">浏览器</div>
                    <div className="text-gray-600">
                      {performanceInfo.browser}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Zap className="w-6 h-6 text-orange-600" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      WebGL 支持
                    </div>
                    <div className="text-gray-600">
                      {performanceInfo.hasWebGL ? "WebGL" : "不支持"}
                      {performanceInfo.hasWebGL2 && " + WebGL2"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Settings className="w-6 h-6 text-indigo-600" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      WebCodecs 支持
                    </div>
                    <div className="text-gray-600">
                      {performanceInfo.hasWebCodecs ? "支持" : "不支持"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Info className="w-6 h-6 text-teal-600" />
                  <div>
                    <div className="font-semibold text-gray-900">平台</div>
                    <div className="text-gray-600">
                      {performanceInfo.platform}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 优化建议 */}
        {recommendations && (
          <div className="education-card p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">优化建议</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      并行处理
                    </span>
                    <span
                      className={
                        getOptimizationStatus(
                          recommendations.useParallelProcessing
                        ).color
                      }
                    >
                      {
                        getOptimizationStatus(
                          recommendations.useParallelProcessing
                        ).text
                      }
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    基于您的 {performanceInfo?.cpuCores} 核 CPU
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      批处理大小
                    </span>
                    <span className="text-blue-600 font-semibold">
                      {recommendations.batchSize}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">优化的并发处理数量</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      硬件加速
                    </span>
                    <span
                      className={
                        getOptimizationStatus(
                          recommendations.useHardwareAcceleration
                        ).color
                      }
                    >
                      {
                        getOptimizationStatus(
                          recommendations.useHardwareAcceleration
                        ).text
                      }
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    基于 WebGL2 和 WebCodecs 支持
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      编码预设
                    </span>
                    <span className="text-green-600 font-semibold">
                      {recommendations.qualityPreset}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">平衡质量和处理速度</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">CRF 值</span>
                    <span className="text-purple-600 font-semibold">
                      {recommendations.crfValue}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">视频质量参数 (18-28)</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      音频比特率
                    </span>
                    <span className="text-orange-600 font-semibold">
                      {recommendations.audioBitrate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">音频质量设置</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 性能提升建议 */}
        <div className="education-card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            性能提升建议
          </h2>
          <div className="space-y-4">
            {performanceScore < 60 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">
                      性能优化建议
                    </h3>
                    <ul className="text-yellow-700 text-sm mt-2 space-y-1">
                      {performanceInfo && performanceInfo.cpuCores < 4 && (
                        <li>
                          • 考虑使用更多 CPU 核心的设备以获得更好的并行处理性能
                        </li>
                      )}
                      {performanceInfo && performanceInfo.memoryGB < 4 && (
                        <li>• 增加系统内存可以提升大文件处理能力</li>
                      )}
                      {performanceInfo && !performanceInfo.hasWebGL2 && (
                        <li>• 使用支持 WebGL2 的现代浏览器以获得硬件加速</li>
                      )}
                      {performanceInfo && !performanceInfo.hasWebCodecs && (
                        <li>
                          • 使用支持 WebCodecs 的浏览器以获得更好的视频处理性能
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-800">使用建议</h3>
                  <ul className="text-blue-700 text-sm mt-2 space-y-1">
                    <li>• 视频生成功能会自动应用这些优化设置</li>
                    <li>• 处理大文件时建议关闭其他应用程序以释放内存</li>
                    <li>• 使用 Chrome 或 Edge 浏览器可获得最佳性能</li>
                    <li>• 定期刷新性能信息以获取最新的优化建议</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
