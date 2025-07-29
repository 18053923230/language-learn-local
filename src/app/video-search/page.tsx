"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Video,
  Download,
  Play,
  Filter,
  TrendingUp,
  Clock,
  FileText,
  Globe,
  Settings,
  Info,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { VideoPreviewPlayer } from "@/components/video-preview-player";
import Link from "next/link";
import {
  subtitleSearchService,
  MultiVideoSearchResult,
  SearchOptions,
} from "@/lib/subtitle-search";
import { VideoSegment, VideoGenerationProgress } from "@/lib/video-generator";
import { Subtitle } from "@/types/subtitle";
import { getVideoGenerator } from "@/lib/environment";
import { fetchFile } from "@ffmpeg/util";
import { toast } from "sonner";

export default function VideoSearchPage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] =
    useState<MultiVideoSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generationProgress, setGenerationProgress] =
    useState<VideoGenerationProgress | null>(null);
  const [generationOptions, setGenerationOptions] = useState({
    outputFormat: "mp4" as "mp4" | "webm" | "avi",
    quality: "medium" as "low" | "medium" | "high",
    includeTransitions: true,
    transitionDuration: 0.5,
    addSubtitles: true,
    subtitleStyle: "overlay" as "burned" | "overlay",
    outputResolution: "720p" as "720p" | "1080p" | "480p",
  });
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    caseSensitive: false,
    exactMatch: false,
    includePartial: true,
    fuzzyMatch: false,
    maxResults: 50,
    minRelevance: 0.3,
  });
  const [filterOptions, setFilterOptions] = useState({
    language: "",
    source: "all" as "all" | "assemblyai" | "upload" | "manual",
  });
  const [stats, setStats] = useState<{
    totalVideos: number;
    totalSubtitles: number;
    languages: string[];
    sources: { [key: string]: number };
    averageConfidence: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewPlayer, setPreviewPlayer] = useState<{
    isOpen: boolean;
    videoFile: File | null;
    startTime: number;
    endTime: number;
  }>({
    isOpen: false,
    videoFile: null,
    startTime: 0,
    endTime: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setError(null);
      const searchStats = await subtitleSearchService.getSearchStats();
      setStats(searchStats);
    } catch (error) {
      console.error("Error loading stats:", error);
      setError("Failed to load search statistics");
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      toast.error("Please enter a search keyword");
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      const results = await subtitleSearchService.searchAcrossAllVideos(
        searchKeyword,
        {
          ...searchOptions,
          language: filterOptions.language || undefined,
          source: filterOptions.source === "all" ? "all" : filterOptions.source,
        }
      );
      setSearchResults(results);
      toast.success(
        `Found ${results.matchedSubtitles} matching subtitles from ${results.totalVideos} videos`
      );
    } catch (error) {
      console.error("Search error:", error);
      setError("Search failed. Please try again.");
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!searchResults || searchResults.results.length === 0) {
      toast.error("No search results available for generation");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(null);
    try {
      // 尝试从存储服务获取视频文件
      const { videoStorageService } = await import("@/lib/video-storage");

      // 为每个搜索结果尝试获取视频文件
      const enhancedSegments = await Promise.all(
        searchResults.results.map(async (result) => {
          try {
            const videoFile = await videoStorageService.getVideoFile(
              result.record.videoId
            );
            return {
              subtitle: result.subtitle,
              videoFile,
              startTime: result.subtitle.start,
              endTime: result.subtitle.end,
              record: result.record,
            };
          } catch (error) {
            console.warn(
              `Could not get video file for ${result.record.videoId}:`,
              error
            );
            return {
              subtitle: result.subtitle,
              videoFile: null,
              startTime: result.subtitle.start,
              endTime: result.subtitle.end,
              record: result.record,
            };
          }
        })
      );

      // 检查是否有可用的视频文件
      const availableSegments = enhancedSegments.filter(
        (segment) => segment.videoFile
      );

      console.log(
        `Found ${availableSegments.length} video files out of ${enhancedSegments.length} segments`
      );

      if (availableSegments.length === 0) {
        // 如果没有视频文件，生成字幕文件作为替代
        console.log(
          "No video files available, generating subtitle file instead"
        );

        // 生成字幕文件
        const subtitleContent = searchResults.results
          .map((result, index) => {
            const startTime = formatTimeForSRT(result.subtitle.start);
            const endTime = formatTimeForSRT(result.subtitle.end);
            return `${index + 1}\n${startTime} --> ${endTime}\n${
              result.subtitle.text
            }\n`;
          })
          .join("\n");

        const timestamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "-");
        const filename = `subtitles-${searchKeyword}-${timestamp}.srt`;

        const blob = new Blob([subtitleContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(
          `Subtitle file generated successfully! ${searchResults.results.length} segments exported.`
        );
        return;
      }

      // 根据环境获取相应的视频生成器
      const videoGenerator = await getVideoGenerator();

      // 显示性能优化信息
      const { videoPerformanceOptimizer } = await import(
        "@/lib/video-performance-optimizer"
      );
      const performanceReport =
        videoPerformanceOptimizer.getPerformanceReport();
      console.log("Using performance optimization:", performanceReport);

      // 检查片段数量，如果太多则分批处理
      const MAX_SEGMENTS_PER_BATCH = 20; // 每批最多20个片段

      let videoBlob: Blob;

      if (availableSegments.length > MAX_SEGMENTS_PER_BATCH) {
        // 片段太多，分批处理
        toast.info(
          `Processing ${availableSegments.length} segments in batches of ${MAX_SEGMENTS_PER_BATCH} for better performance`
        );

        const batches = [];
        for (
          let i = 0;
          i < availableSegments.length;
          i += MAX_SEGMENTS_PER_BATCH
        ) {
          batches.push(availableSegments.slice(i, i + MAX_SEGMENTS_PER_BATCH));
        }

        console.log(
          `Processing ${availableSegments.length} segments in ${batches.length} batches`
        );

        const batchBlobs: Blob[] = [];

        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];

          setGenerationProgress({
            stage: "processing",
            progress: (batchIndex / batches.length) * 0.8,
            message: `Processing batch ${batchIndex + 1} of ${
              batches.length
            } (${batch.length} segments)...`,
            currentSegment: batchIndex + 1,
            totalSegments: batches.length,
          });

          // 处理当前批次
          const uniqueVideoIds = new Set(batch.map((s) => s.record.videoId));

          let batchBlob: Blob;

          if (uniqueVideoIds.size === 1) {
            // 单视频批次
            const videoFile = batch[0].videoFile!;
            const subtitles = batch.map((s) => s.subtitle) as Subtitle[];

            batchBlob = await videoGenerator.generateFromSingleVideo(
              videoFile,
              subtitles,
              {
                ...generationOptions,
                useOptimization: true,
                parallelProcessing: true,
                useHardwareAcceleration: true,
              },
              (progress: VideoGenerationProgress) => {
                const adjustedProgress = {
                  ...progress,
                  progress:
                    (batchIndex / batches.length) * 0.8 +
                    progress.progress * (1 / batches.length) * 0.8,
                  message: `Batch ${batchIndex + 1}: ${progress.message}`,
                };
                setGenerationProgress(adjustedProgress);
              }
            );
          } else {
            // 多视频批次
            batchBlob = await videoGenerator.generateFromMultipleVideos(
              batch as VideoSegment[],
              {
                ...generationOptions,
                useOptimization: true,
                parallelProcessing: true,
                useHardwareAcceleration: true,
              },
              (progress: VideoGenerationProgress) => {
                const adjustedProgress = {
                  ...progress,
                  progress:
                    (batchIndex / batches.length) * 0.8 +
                    progress.progress * (1 / batches.length) * 0.8,
                  message: `Batch ${batchIndex + 1}: ${progress.message}`,
                };
                setGenerationProgress(adjustedProgress);
              }
            );
          }

          batchBlobs.push(batchBlob);
        }

        // 最终合并所有批次
        setGenerationProgress({
          stage: "combining",
          progress: 0.8,
          message: "Combining all batches...",
        });

        // 简化：直接合并所有blob
        setGenerationProgress({
          stage: "combining",
          progress: 0.8,
          message: "Combining all batches...",
        });

        // 创建一个包含所有批次的blob
        videoBlob = new Blob(batchBlobs, {
          type: `video/${generationOptions.outputFormat}`,
        });
      } else {
        // 片段数量正常，使用原来的逻辑
        const uniqueVideoIds = new Set(
          availableSegments.map((s) => s.record.videoId)
        );

        if (uniqueVideoIds.size === 1) {
          // 只有一个视频文件，使用主页的逻辑
          const videoFile = availableSegments[0].videoFile!;
          const subtitles = availableSegments.map(
            (s) => s.subtitle
          ) as Subtitle[];

          videoBlob = await videoGenerator.generateFromSingleVideo(
            videoFile,
            subtitles,
            {
              ...generationOptions,
              useOptimization: true,
              parallelProcessing: true,
              useHardwareAcceleration: true,
            },
            (progress: VideoGenerationProgress) => {
              console.log("Video generation progress:", progress);
              setGenerationProgress(progress);
            }
          );
        } else {
          // 多个视频文件，暂时使用原来的方法
          videoBlob = await videoGenerator.generateFromMultipleVideos(
            availableSegments as VideoSegment[],
            {
              ...generationOptions,
              useOptimization: true,
              parallelProcessing: true,
              useHardwareAcceleration: true,
            },
            (progress: VideoGenerationProgress) => {
              console.log("Video generation progress:", progress);
              setGenerationProgress(progress);
            }
          );
        }
      }

      // 生成文件名
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `multi-video-${searchKeyword}-${timestamp}.mp4`;

      // 创建下载链接
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        `Video generated successfully! ${availableSegments.length} segments combined.`
      );
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Video generation error:", error);
      toast.error("Video generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 格式化时间为 SRT 格式
  const formatTimeForSRT = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms
      .toString()
      .padStart(3, "0")}`;
  };

  const getKeywordSuggestions = async (partial: string) => {
    if (partial.length < 2) return [];
    try {
      return await subtitleSearchService.getKeywordSuggestions(partial, 5);
    } catch (error) {
      return [];
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

  const handlePlayPreview = async (result: {
    record: { videoId: string };
    subtitle: { start: number; end: number };
  }) => {
    try {
      // 尝试从存储中获取视频文件
      const { videoStorageService } = await import("@/lib/video-storage");
      const videoFile = await videoStorageService.getVideoFile(
        result.record.videoId
      );

      if (videoFile) {
        // 检查文件是否有效
        console.log("Video file details:", {
          name: videoFile.name,
          size: videoFile.size,
          type: videoFile.type,
          lastModified: videoFile.lastModified,
        });

        if (videoFile.size > 0 && videoFile.type) {
          setPreviewPlayer({
            isOpen: true,
            videoFile,
            startTime: result.subtitle.start,
            endTime: result.subtitle.end,
          });
          toast.success("Video loaded for preview");
        } else {
          console.error("Invalid video file:", videoFile);
          toast.error("Invalid video file");
        }
      } else {
        toast.error("Video file not found");
      }
    } catch (error) {
      console.error("Error loading video for preview:", error);
      toast.error("Failed to load video for preview");
    }
  };

  const handleRemoveResult = (resultToRemove: {
    record: { id: string };
    subtitle: { id: string };
  }) => {
    if (!searchResults) return;

    const updatedResults = searchResults.results.filter(
      (result) =>
        !(
          result.record.id === resultToRemove.record.id &&
          result.subtitle.id === resultToRemove.subtitle.id
        )
    );

    const updatedVideoSegments = searchResults.videoSegments.filter(
      (segment) => !(segment.subtitle.id === resultToRemove.subtitle.id)
    );

    setSearchResults({
      ...searchResults,
      results: updatedResults,
      videoSegments: updatedVideoSegments,
      matchedSubtitles: updatedResults.length,
    });

    toast.success("Result removed from search results");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Multi-Video Search
              </h1>
              <p className="text-gray-600 mt-2">
                Search across all your videos and generate learning content
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/video-search/help">
                <Button variant="outline" size="sm">
                  <Info className="w-4 h-4 mr-2" />
                  Help
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="education-card p-6 mb-8 bg-red-50 border border-red-200">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm">⚠️</span>
              </div>
              <div>
                <h3 className="text-red-800 font-semibold">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="education-card p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.totalVideos}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Total Videos
              </div>
            </div>
            <div className="education-card p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.totalSubtitles.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Total Subtitles
              </div>
            </div>
            <div className="education-card p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.languages.length}
              </div>
              <div className="text-sm text-gray-600 font-medium">Languages</div>
            </div>
            <div className="education-card p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {(stats.averageConfidence * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Avg Confidence
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="education-card p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Search Across All Videos
            </h2>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Enter keyword or phrase to search..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="education-input w-full pl-12 pr-4 py-4 text-lg"
            />
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={filterOptions.language}
                onChange={(e) =>
                  setFilterOptions((prev) => ({
                    ...prev,
                    language: e.target.value,
                  }))
                }
                className="education-input w-full"
              >
                <option value="">All Languages</option>
                {stats?.languages.map((lang: string) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                value={filterOptions.source}
                onChange={(e) =>
                  setFilterOptions((prev) => ({
                    ...prev,
                    source: e.target.value as
                      | "all"
                      | "assemblyai"
                      | "upload"
                      | "manual",
                  }))
                }
                className="education-input w-full"
              >
                <option value="all">All Sources</option>
                <option value="assemblyai">AssemblyAI</option>
                <option value="upload">Uploaded</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Results
              </label>
              <select
                value={searchOptions.maxResults}
                onChange={(e) =>
                  setSearchOptions((prev) => ({
                    ...prev,
                    maxResults: parseInt(e.target.value),
                  }))
                }
                className="education-input w-full"
              >
                <option value={25}>25 results</option>
                <option value={50}>50 results</option>
                <option value={100}>100 results</option>
                <option value={200}>200 results</option>
              </select>
            </div>
          </div>

          {/* Search Options */}
          <div className="flex items-center space-x-6 mb-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={searchOptions.includePartial}
                onChange={(e) =>
                  setSearchOptions((prev) => ({
                    ...prev,
                    includePartial: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Partial matches</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={searchOptions.fuzzyMatch}
                onChange={(e) =>
                  setSearchOptions((prev) => ({
                    ...prev,
                    fuzzyMatch: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Fuzzy matching</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={searchOptions.caseSensitive}
                onChange={(e) =>
                  setSearchOptions((prev) => ({
                    ...prev,
                    caseSensitive: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Case sensitive</span>
            </label>
          </div>

          {/* Search Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchKeyword.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
              size="lg"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-3" />
                  Search Videos
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults && (
          <div className="education-card p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Search Results for &quot;{searchKeyword}&quot;
                </h3>
                <p className="text-gray-600 mt-1">
                  Found {searchResults.matchedSubtitles} subtitles from{" "}
                  {searchResults.totalVideos} videos in{" "}
                  {searchResults.searchTime}ms
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  disabled={searchResults.results.length === 0}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Generate & Download
                </Button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {searchResults.matchedSubtitles} Matches
                  </span>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Video className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    {searchResults.totalVideos} Videos
                  </span>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">
                    {searchResults.searchTime}ms
                  </span>
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Download className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">
                    {
                      searchResults.videoSegments.filter((s) => s.videoFile)
                        .length
                    }{" "}
                    Video Files
                  </span>
                </div>
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {searchResults.results.map((result, index) => (
                <div
                  key={`${result.record.id}-${result.subtitle.id}`}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {formatDuration(result.subtitle.start)} -{" "}
                          {formatDuration(result.subtitle.end)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            result.matchType === "exact"
                              ? "bg-green-100 text-green-700"
                              : result.matchType === "partial"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {result.matchType}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                          {Math.round(result.relevance * 100)}%
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-800 mb-2">
                        {result.subtitle.text}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <span>{result.record.language}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <FileText className="w-3 h-3" />
                          <span>{result.record.videoName}</span>
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePlayPreview(result)}
                        className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
                        title="Play preview"
                      >
                        <Play className="w-3 h-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveResult(result)}
                        className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                        title="Remove from results"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Generation Progress Dialog */}
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
                Create a video from {searchResults?.results.length || 0}{" "}
                filtered subtitle segments.
                {searchKeyword && (
                  <span className="block mt-2 text-sm bg-purple-50 text-purple-700 px-3 py-2 rounded-lg">
                    Filtered by: <strong>&quot;{searchKeyword}&quot;</strong>
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
                          outputFormat: e.target.value as
                            | "mp4"
                            | "webm"
                            | "avi",
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
                disabled={isGenerating || !searchResults?.results.length}
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

        {/* Video Preview Player */}
        {previewPlayer.isOpen && previewPlayer.videoFile && (
          <VideoPreviewPlayer
            videoFile={previewPlayer.videoFile}
            startTime={previewPlayer.startTime}
            endTime={previewPlayer.endTime}
            isOpen={previewPlayer.isOpen}
            onClose={() =>
              setPreviewPlayer({ ...previewPlayer, isOpen: false })
            }
          />
        )}
      </div>
    </div>
  );
}
