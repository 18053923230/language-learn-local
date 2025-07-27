"use client";

import { useState } from "react";
import { Subtitle } from "@/types/subtitle";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  Zap,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  BarChart3,
  Clock,
  MessageSquare,
} from "lucide-react";
import {
  subtitleOptimizer,
  OptimizationOptions,
} from "@/lib/subtitle-optimizer";
import { toast } from "sonner";

interface SubtitleOptimizerProps {
  subtitles: Subtitle[];
  onOptimize: (optimizedSubtitles: Subtitle[]) => void;
  onCancel: () => void;
}

export function SubtitleOptimizer({
  subtitles,
  onOptimize,
  onCancel,
}: SubtitleOptimizerProps) {
  const [options, setOptions] = useState<OptimizationOptions>({
    mergeShortSegments: true,
    splitLongSegments: true,
    fixTiming: true,
    improveConfidence: true,
    maxSegmentLength: 120,
    minSegmentLength: 10,
    maxSegmentDuration: 8,
    minSegmentDuration: 1,
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [preview, setPreview] = useState<Subtitle[] | null>(null);
  const [stats, setStats] = useState<any>(null);

  const handleOptimize = async () => {
    setIsOptimizing(true);

    try {
      const optimized = subtitleOptimizer.optimizeSubtitles(subtitles, options);
      const optimizationStats = subtitleOptimizer.getOptimizationStats(
        subtitles,
        optimized
      );

      setPreview(optimized);
      setStats(optimizationStats);

      toast.success("字幕优化完成！");
    } catch (error) {
      console.error("Optimization error:", error);
      toast.error("优化过程中出现错误");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApply = () => {
    if (preview) {
      onOptimize(preview);
      toast.success("已应用优化后的字幕");
    }
  };

  const handleReset = () => {
    setPreview(null);
    setStats(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">字幕优化器</h3>
            <p className="text-sm text-gray-500">智能优化字幕分段和时间</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="education-button-secondary"
          >
            取消
          </Button>
          <Button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="education-button"
          >
            {isOptimizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                优化中...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                开始优化
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 优化选项 */}
        <div className="lg:col-span-1">
          <Card className="education-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>优化选项</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 基本选项 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>合并短片段</span>
                  </Label>
                  <Switch
                    checked={options.mergeShortSegments}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, mergeShortSegments: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>分割长片段</span>
                  </Label>
                  <Switch
                    checked={options.splitLongSegments}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, splitLongSegments: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>修复时间重叠</span>
                  </Label>
                  <Switch
                    checked={options.fixTiming}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, fixTiming: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>改善置信度</span>
                  </Label>
                  <Switch
                    checked={options.improveConfidence}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, improveConfidence: checked })
                    }
                  />
                </div>
              </div>

              {/* 参数设置 */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <Label>最大片段长度 (字符)</Label>
                  <Input
                    type="number"
                    value={options.maxSegmentLength}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        maxSegmentLength: parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>最小片段长度 (字符)</Label>
                  <Input
                    type="number"
                    value={options.minSegmentLength}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        minSegmentLength: parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>最大片段时长 (秒)</Label>
                  <Input
                    type="number"
                    value={options.maxSegmentDuration}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        maxSegmentDuration: parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>最小片段时长 (秒)</Label>
                  <Input
                    type="number"
                    value={options.minSegmentDuration}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        minSegmentDuration: parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 预览和统计 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 统计信息 */}
          {stats && (
            <Card className="education-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>优化统计</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.originalCount}
                    </div>
                    <div className="text-sm text-gray-500">原始片段</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.optimizedCount}
                    </div>
                    <div className="text-sm text-gray-500">优化后片段</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.averageLength}
                    </div>
                    <div className="text-sm text-gray-500">平均长度</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.averageDuration}s
                    </div>
                    <div className="text-sm text-gray-500">平均时长</div>
                  </div>
                </div>

                {stats.improvements.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">优化改进：</span>
                    </div>
                    <ul className="mt-2 text-sm text-green-600">
                      {stats.improvements.map(
                        (improvement: string, index: number) => (
                          <li key={index}>• {improvement}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 预览 */}
          {preview && (
            <Card className="education-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>优化预览</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="education-button-secondary"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      重置
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApply}
                      className="education-button"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      应用
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {preview.slice(0, 10).map((subtitle, index) => (
                    <div
                      key={subtitle.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span className="font-mono">
                          {Math.floor(subtitle.start / 60)}:
                          {(subtitle.start % 60).toFixed(3)} -{" "}
                          {Math.floor(subtitle.end / 60)}:
                          {(subtitle.end % 60).toFixed(3)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            subtitle.confidence > 0.8
                              ? "bg-green-100 text-green-700"
                              : subtitle.confidence > 0.6
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {Math.round(subtitle.confidence * 100)}%
                        </span>
                      </div>
                      <p className="text-gray-900">{subtitle.text}</p>
                    </div>
                  ))}
                  {preview.length > 10 && (
                    <div className="text-center text-gray-500 text-sm">
                      显示前10个片段，共{preview.length}个片段
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
