"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { VideoPlayer } from "@/components/video-player";
import {
  videoGenerator,
  VideoGenerationOptions,
  VideoGenerationProgress,
} from "@/lib/video-generator";
import { Subtitle } from "@/types/subtitle";
import { Video } from "@/types/video";
import {
  Video as VideoIcon,
  Download,
  Settings,
  Play,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function TestVideoGenerationPage() {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [filteredSubtitles, setFilteredSubtitles] = useState<Subtitle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] =
    useState<VideoGenerationProgress | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(
    null
  );
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

  const handleFileSelect = async (file: File, language: string) => {
    const video: Video = {
      id: `test-${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      duration: 0,
      size: file.size,
      format: file.name.split(".").pop() || "",
      language,
      uploadedAt: new Date(),
      processed: false,
      file,
    };

    setCurrentVideo(video);

    // 生成模拟字幕数据
    const mockSubtitles: Subtitle[] = [
      {
        id: "1",
        text: "Hello, welcome to our language learning application.",
        start: 0,
        end: 3,
        confidence: 0.95,
        language,
        videoId: video.id,
      },
      {
        id: "2",
        text: "Today we will learn about different topics.",
        start: 3,
        end: 6,
        confidence: 0.92,
        language,
        videoId: video.id,
      },
      {
        id: "3",
        text: "Let's start with the letter A and its pronunciation.",
        start: 6,
        end: 9,
        confidence: 0.88,
        language,
        videoId: video.id,
      },
      {
        id: "4",
        text: "The letter A makes the sound 'ah' as in apple.",
        start: 9,
        end: 12,
        confidence: 0.9,
        language,
        videoId: video.id,
      },
      {
        id: "5",
        text: "Now let's practice with some words containing the letter A.",
        start: 12,
        end: 15,
        confidence: 0.87,
        language,
        videoId: video.id,
      },
      {
        id: "6",
        text: "Apple, cat, hat, and map all contain the letter A.",
        start: 15,
        end: 18,
        confidence: 0.93,
        language,
        videoId: video.id,
      },
      {
        id: "7",
        text: "Great job! You're learning the letter A very well.",
        start: 18,
        end: 21,
        confidence: 0.91,
        language,
        videoId: video.id,
      },
    ];

    setSubtitles(mockSubtitles);
    setFilteredSubtitles(mockSubtitles);
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredSubtitles(subtitles);
      return;
    }

    const filtered = subtitles.filter((subtitle) =>
      subtitle.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubtitles(filtered);
  };

  const handleGenerateVideo = async () => {
    if (!currentVideo?.file || filteredSubtitles.length === 0) {
      toast.error("No video file or filtered subtitles available");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(null);

    try {
      const videoBlob = await videoGenerator.generateFromSingleVideo(
        currentVideo.file,
        filteredSubtitles,
        generationOptions,
        (progress) => {
          setGenerationProgress(progress);
        }
      );

      // 创建视频URL用于播放
      const url = URL.createObjectURL(videoBlob);
      setGeneratedVideoUrl(url);

      // 生成下载文件名
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const keyword = searchTerm || "filtered";
      const filename = `learning-video-${keyword}-${timestamp}.${generationOptions.outputFormat}`;

      toast.success(
        `Video generated successfully! ${filteredSubtitles.length} segments combined.`
      );

      // 自动下载
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
        return <VideoIcon className="w-4 h-4" />;
      case "finalizing":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Video Generation Test
              </h1>
              <p className="text-gray-600 mt-2">
                Test and demonstrate video generation from filtered subtitles
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentVideo ? (
          // Upload Screen
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <VideoIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Test Video Generation
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Upload a video to test the video generation feature with mock
                  subtitles
                </p>
              </div>

              <div className="education-card p-8 max-w-lg mx-auto">
                <FileUpload onFileSelect={handleFileSelect} />
              </div>
            </div>
          </div>
        ) : (
          // Test Interface
          <div className="space-y-8">
            {/* Video Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Original Video */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Original Video
                </h3>
                <div className="education-card overflow-hidden w-full aspect-video">
                  <VideoPlayer url={currentVideo.url} />
                </div>
                <div className="mt-4 education-card p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {currentVideo.name}
                  </h4>
                  <div className="text-sm text-gray-600">
                    Language: {currentVideo.language} | Duration:{" "}
                    {formatTime(currentVideo.duration)}
                  </div>
                </div>
              </div>

              {/* Generated Video */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Generated Video
                </h3>
                {generatedVideoUrl ? (
                  <div className="education-card overflow-hidden w-full aspect-video">
                    <VideoPlayer url={generatedVideoUrl} />
                  </div>
                ) : (
                  <div className="education-card w-full aspect-video flex items-center justify-center bg-gray-100">
                    <div className="text-center text-gray-500">
                      <VideoIcon className="w-12 h-12 mx-auto mb-4" />
                      <p>Generated video will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search and Filter */}
            <div className="education-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Filter Subtitles
              </h3>
              <div className="flex space-x-4 mb-4">
                <input
                  type="text"
                  placeholder="Search subtitles (e.g., 'letter', 'A')..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="education-input flex-1"
                />
                <Button
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Search
                </Button>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                Found {filteredSubtitles.length} of {subtitles.length} subtitles
                {searchTerm && ` matching "${searchTerm}"`}
              </div>

              {/* Generation Options */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format
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
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
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
                    <option value="0.3">Quick</option>
                    <option value="0.5">Normal</option>
                    <option value="1.0">Slow</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleGenerateVideo}
                  disabled={isGenerating || filteredSubtitles.length === 0}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <VideoIcon className="w-5 h-5 mr-3" />
                      Generate Video ({filteredSubtitles.length} segments)
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Generation Progress */}
            {isGenerating && generationProgress && (
              <div className="education-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Generation Progress
                </h3>
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

            {/* Subtitles List */}
            <div className="education-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Subtitles ({filteredSubtitles.length} of {subtitles.length})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredSubtitles.map((subtitle) => (
                  <div
                    key={subtitle.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {formatTime(subtitle.start)} -{" "}
                            {formatTime(subtitle.end)}
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {Math.round(subtitle.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{subtitle.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
