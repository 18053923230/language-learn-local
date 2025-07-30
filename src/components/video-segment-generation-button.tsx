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
} from "lucide-react";
import { Subtitle } from "@/types/subtitle";
import { Video as VideoType } from "@/types/video";
import {
  VideoSegmentGenerationOptions,
  VideoSegmentGenerationProgress,
  videoSegmentGenerator,
} from "@/lib/video-segment-generator";
import { toast } from "sonner";

interface VideoSegmentGenerationButtonProps {
  subtitles: Subtitle[];
  filteredSubtitles: Subtitle[];
  currentVideo: VideoType | null;
  searchTerm: string;
  onSegmentsGenerated?: (segments: any[]) => void;
}

export function VideoSegmentGenerationButton({
  subtitles,
  filteredSubtitles,
  currentVideo,
  searchTerm,
  onSegmentsGenerated,
}: VideoSegmentGenerationButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] =
    useState<VideoSegmentGenerationProgress | null>(null);
  const [generationOptions, setGenerationOptions] =
    useState<VideoSegmentGenerationOptions>({
      outputFormat: "mp4",
      quality: "medium",
      outputResolution: "720p",
    });
  const [folderName, setFolderName] = useState("");

  const handleGenerateSegments = async () => {
    if (!currentVideo?.file || filteredSubtitles.length === 0) {
      toast.error("没有可用的视频文件或过滤后的字幕");
      return;
    }

    if (!folderName.trim()) {
      toast.error("请输入文件夹名称");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(null);

    try {
      const segments = await videoSegmentGenerator.generateSegments(
        currentVideo.file,
        filteredSubtitles,
        folderName.trim(),
        generationOptions,
        (progress) => {
          setGenerationProgress(progress);
        }
      );

      toast.success(
        `成功生成 ${segments.length} 个视频片段！文件已下载到浏览器默认下载目录。`
      );

      // 回调通知父组件
      onSegmentsGenerated?.(segments);

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
      case "preparing":
        return "text-blue-600";
      case "processing":
        return "text-yellow-600";
      case "saving":
        return "text-green-600";
      case "completed":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getProgressIcon = (stage: string) => {
    switch (stage) {
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

  // 自动生成文件夹名称
  const generateFolderName = () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const keyword = searchTerm || "filtered";
    const videoName = currentVideo?.name?.split(".")[0] || "video";
    return `${videoName}_${keyword}_${timestamp}`;
  };

  // 在对话框打开时自动生成文件夹名称
  const handleDialogOpen = () => {
    setFolderName(generateFolderName());
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleDialogOpen}
        disabled={filteredSubtitles.length === 0 || !currentVideo?.file}
        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
        size="sm"
      >
        <FolderOpen className="w-4 h-4 mr-2" />
        生成片段 ({filteredSubtitles.length})
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-2xl border-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center space-x-3 text-xl font-bold">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-900">生成视频片段</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 leading-relaxed">
              为 {filteredSubtitles.length} 个字幕片段生成独立的视频文件。
              {searchTerm && (
                <span className="block mt-2 text-sm bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                  过滤条件: <strong>"{searchTerm}"</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Generation Options */}
          {!isGenerating && (
            <div className="space-y-4">
              {/* Folder Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文件夹名称
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="输入文件夹名称"
                  className="education-input w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  片段文件将保存到此文件夹中
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    输出格式
                  </label>
                  <select
                    value={generationOptions.outputFormat}
                    onChange={(e) =>
                      setGenerationOptions((prev) => ({
                        ...prev,
                        outputFormat: e.target.value as "mp4" | "webm" | "avi",
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
                  value={generationOptions.outputResolution}
                  onChange={(e) =>
                    setGenerationOptions((prev) => ({
                      ...prev,
                      outputResolution: e.target.value as
                        | "720p"
                        | "1080p"
                        | "480p",
                    }))
                  }
                  className="education-input w-full"
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                </select>
              </div>

              {/* Info about the process */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">生成说明：</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• 每个字幕片段将生成独立的视频文件</li>
                      <li>• 文件将自动下载到浏览器默认下载目录</li>
                      <li>• 同时生成片段信息文件 (JSON格式)</li>
                      <li>• 可使用第三方软件手动合成完整视频</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generation Progress */}
          {isGenerating && generationProgress && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
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
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-600 h-2 rounded-full transition-all duration-300"
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
              onClick={handleGenerateSegments}
              disabled={
                isGenerating ||
                filteredSubtitles.length === 0 ||
                !folderName.trim()
              }
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  生成片段
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
