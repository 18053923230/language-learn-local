"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Video,
  Settings,
  Download,
  FolderOpen,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Zap,
  Database,
} from "lucide-react";
import { Subtitle } from "@/types/subtitle";
import { Video as VideoType } from "@/types/video";
import {
  SegmentGenerationOptions,
  SegmentGenerationProgress,
  VideoSegmentFolder,
} from "@/types/video-segment";
import { smartVideoSegmentManager } from "@/lib/smart-video-segment-manager";
import { videoSegmentStorage } from "@/lib/video-segment-storage";
import { toast } from "sonner";

interface SmartVideoSegmentButtonProps {
  subtitles: Subtitle[];
  filteredSubtitles: Subtitle[];
  currentVideo: VideoType | null;
  searchTerm: string;
  onSegmentsGenerated?: (folder: VideoSegmentFolder) => void;
}

export function SmartVideoSegmentButton({
  subtitles,
  filteredSubtitles,
  currentVideo,
  searchTerm,
  onSegmentsGenerated,
}: SmartVideoSegmentButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] =
    useState<SegmentGenerationProgress | null>(null);
  const [generationOptions, setGenerationOptions] =
    useState<SegmentGenerationOptions>({
      format: "mp4",
      quality: "medium",
      resolution: "720p",
    });
  const [segmentStats, setSegmentStats] = useState<any>(null);

  const handleSmartGenerateSegments = async () => {
    if (!currentVideo?.file || filteredSubtitles.length === 0) {
      toast.error("没有可用的视频文件或过滤后的字幕");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(null);

    try {
      const folder = await smartVideoSegmentManager.smartGenerateSegments(
        currentVideo,
        filteredSubtitles,
        generationOptions,
        (progress) => {
          setGenerationProgress(progress);
        }
      );

      // 获取片段统计信息
      const stats = await videoSegmentStorage.getSegmentStats(currentVideo.id);
      setSegmentStats(stats);

      if (folder.status === "completed") {
        toast.success(
          `智能生成完成！${folder.completedSegments} 个片段已保存到文件夹。`
        );
      } else {
        toast.warning("片段生成部分完成，请检查详细信息。");
      }

      // 回调通知父组件
      onSegmentsGenerated?.(folder);

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error generating video segments:", error);
      toast.error("生成视频片段失败，请重试。");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  const getProgressColor = (stage: string) => {
    switch (stage) {
      case "checking":
        return "text-blue-600";
      case "preparing":
        return "text-yellow-600";
      case "processing":
        return "text-green-600";
      case "saving":
        return "text-purple-600";
      case "completed":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getProgressIcon = (stage: string) => {
    switch (stage) {
      case "checking":
        return <Database className="w-4 h-4" />;
      case "preparing":
        return <Settings className="w-4 h-4" />;
      case "processing":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "saving":
        return <Download className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // 检查是否有已存在的片段
  const checkExistingSegments = async () => {
    if (!currentVideo) return;

    try {
      const stats = await videoSegmentStorage.getSegmentStats(currentVideo.id);
      setSegmentStats(stats);
    } catch (error) {
      console.error("Error checking existing segments:", error);
    }
  };

  // 在对话框打开时检查现有片段
  const handleDialogOpen = () => {
    checkExistingSegments();
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleDialogOpen}
        disabled={filteredSubtitles.length === 0 || !currentVideo?.file}
        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
        size="sm"
      >
        <Zap className="w-4 h-4 mr-2" />
        智能片段 ({filteredSubtitles.length})
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-2xl border-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center space-x-3 text-xl font-bold">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-900">智能视频片段生成</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 leading-relaxed">
              智能检测并生成视频片段，避免重复处理。
              {searchTerm && (
                <span className="block mt-2 text-sm bg-orange-50 text-orange-700 px-3 py-2 rounded-lg">
                  过滤条件: <strong>"{searchTerm}"</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Existing Segments Info */}
          {segmentStats && segmentStats.totalFolders > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Database className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">现有片段信息：</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• 片段文件夹: {segmentStats.totalFolders} 个</li>
                    <li>• 总片段数: {segmentStats.totalSegments} 个</li>
                    <li>• 已完成: {segmentStats.completedSegments} 个</li>
                    <li>
                      • 总大小:{" "}
                      {(segmentStats.totalSize / 1024 / 1024).toFixed(1)} MB
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Generation Options */}
          {!isGenerating && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    输出格式
                  </label>
                  <select
                    value={generationOptions.format}
                    onChange={(e) =>
                      setGenerationOptions((prev) => ({
                        ...prev,
                        format: e.target.value as "mp4" | "webm" | "avi",
                      }))
                    }
                    className="education-input w-full"
                  >
                    <option value="mp4">MP4</option>
                    <option value="webm">WebM</option>
                    <option value="avi">AVI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    质量
                  </label>
                  <select
                    value={generationOptions.quality}
                    onChange={(e) =>
                      setGenerationOptions((prev) => ({
                        ...prev,
                        quality: e.target.value as "low" | "medium" | "high",
                      }))
                    }
                    className="education-input w-full"
                  >
                    <option value="low">低质量 (文件更小)</option>
                    <option value="medium">中等质量 (平衡)</option>
                    <option value="high">高质量 (更好画质)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分辨率
                </label>
                <select
                  value={generationOptions.resolution}
                  onChange={(e) =>
                    setGenerationOptions((prev) => ({
                      ...prev,
                      resolution: e.target.value as "480p" | "720p" | "1080p",
                    }))
                  }
                  className="education-input w-full"
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                </select>
              </div>

              {/* Smart Features Info */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Zap className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-orange-800">
                    <p className="font-medium">智能功能：</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• 自动检测已存在的片段，避免重复生成</li>
                      <li>• 标准化文件夹命名，便于管理</li>
                      <li>• 数据库索引，支持快速查找</li>
                      <li>• 生成完成后自动打开文件夹</li>
                      <li>• 支持后期快速合成</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generation Progress */}
          {isGenerating && generationProgress && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={getProgressColor(generationProgress.stage)}>
                    {getProgressIcon(generationProgress.stage)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {generationProgress.message}
                    </div>
                    {generationProgress.currentSegment &&
                      generationProgress.totalSegments && (
                        <div className="text-xs text-gray-600">
                          片段 {generationProgress.currentSegment} /{" "}
                          {generationProgress.totalSegments}
                        </div>
                      )}
                    {generationProgress.folderName && (
                      <div className="text-xs text-gray-600">
                        文件夹: {generationProgress.folderName}
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress.progress}%` }}
                  />
                </div>

                <div className="text-xs text-gray-600 mt-2 text-center">
                  {Math.round(generationProgress.progress)}% 完成
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isGenerating}
            >
              取消
            </Button>
            <Button
              onClick={handleSmartGenerateSegments}
              disabled={isGenerating || filteredSubtitles.length === 0}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  智能生成中...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  智能生成片段
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
