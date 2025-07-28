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
  Play,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Subtitle } from "@/types/subtitle";
import { Video as VideoType } from "@/types/video";
import {
  VideoGenerationOptions,
  VideoGenerationProgress,
} from "@/lib/video-generator";
import { getVideoGenerator } from "@/lib/environment";
import { toast } from "sonner";

interface VideoGenerationButtonProps {
  subtitles: Subtitle[];
  filteredSubtitles: Subtitle[];
  currentVideo: VideoType | null;
  searchTerm: string;
  onVideoGenerated?: (videoBlob: Blob, filename: string) => void;
}

export function VideoGenerationButton({
  subtitles,
  filteredSubtitles,
  currentVideo,
  searchTerm,
  onVideoGenerated,
}: VideoGenerationButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] =
    useState<VideoGenerationProgress | null>(null);
  const [generationOptions, setGenerationOptions] =
    useState<VideoGenerationOptions>({
      outputFormat: "mp4",
      quality: "medium",
      includeTransitions: true,
      transitionDuration: 0.5,
      addSubtitles: true,
      subtitleStyle: "overlay",
      outputResolution: "720p",
    });

  const handleGenerateVideo = async () => {
    if (!currentVideo?.file || filteredSubtitles.length === 0) {
      toast.error("No video file or filtered subtitles available");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(null);

    try {
      // 根据环境获取相应的视频生成器
      const videoGenerator = await getVideoGenerator();

      const videoBlob = await videoGenerator.generateFromSingleVideo(
        currentVideo.file,
        filteredSubtitles,
        generationOptions,
        (progress) => {
          setGenerationProgress(progress);
        }
      );

      // 生成文件名
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const keyword = searchTerm || "filtered";
      const filename = `learning-video-${keyword}-${timestamp}.${generationOptions.outputFormat}`;

      // 触发下载
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        `Video generated successfully! ${filteredSubtitles.length} segments combined.`
      );

      // 回调通知父组件
      onVideoGenerated?.(videoBlob, filename);

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to generate video. Please try again.");
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
      case "combining":
        return "text-green-600";
      case "finalizing":
        return "text-purple-600";
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
      case "combining":
        return <Video className="w-4 h-4" />;
      case "finalizing":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        disabled={filteredSubtitles.length === 0 || !currentVideo?.file}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        size="sm"
      >
        <Video className="w-4 h-4 mr-2" />
        Generate Video ({filteredSubtitles.length})
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-2xl border-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center space-x-3 text-xl font-bold">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-900">Generate Learning Video</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 leading-relaxed">
              Create a video from {filteredSubtitles.length} filtered subtitle
              segments.
              {searchTerm && (
                <span className="block mt-2 text-sm bg-purple-50 text-purple-700 px-3 py-2 rounded-lg">
                  Filtered by: <strong>"{searchTerm}"</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Generation Options */}
          {!isGenerating && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Format
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
                    Quality
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
                    <option value="low">Low (Smaller file)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Better quality)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transitions
                  </label>
                  <select
                    value={generationOptions.transitionDuration?.toString()}
                    onChange={(e) =>
                      setGenerationOptions((prev) => ({
                        ...prev,
                        transitionDuration: parseFloat(e.target.value),
                      }))
                    }
                    className="education-input w-full"
                  >
                    <option value="0">None</option>
                    <option value="0.3">Quick (0.3s)</option>
                    <option value="0.5">Normal (0.5s)</option>
                    <option value="1.0">Slow (1.0s)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={generationOptions.addSubtitles}
                    onChange={(e) =>
                      setGenerationOptions((prev) => ({
                        ...prev,
                        addSubtitles: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">
                    Add subtitles to video
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Generation Progress */}
          {isGenerating && generationProgress && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
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
                          Segment {generationProgress.currentSegment} of{" "}
                          {generationProgress.totalSegments}
                        </div>
                      )}
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress.progress}%` }}
                  />
                </div>

                <div className="text-xs text-gray-600 mt-2 text-center">
                  {Math.round(generationProgress.progress)}% Complete
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
              Cancel
            </Button>
            <Button
              onClick={handleGenerateVideo}
              disabled={isGenerating || filteredSubtitles.length === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate & Download
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
