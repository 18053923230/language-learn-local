"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import Link from "next/link";
import {
  subtitleSearchService,
  MultiVideoSearchResult,
  SearchOptions,
} from "@/lib/subtitle-search";
import { videoGenerator, VideoSegment } from "@/lib/video-generator";
import { toast } from "sonner";

export default function VideoSearchPage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] =
    useState<MultiVideoSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const searchStats = await subtitleSearchService.getSearchStats();
      setStats(searchStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      toast.error("Please enter a search keyword");
      return;
    }

    setIsSearching(true);
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
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!searchResults || searchResults.videoSegments.length === 0) {
      toast.error("No video segments available for generation");
      return;
    }

    setIsGenerating(true);
    try {
      // 检查是否有可用的视频文件
      const availableSegments = searchResults.videoSegments.filter(
        (segment) => segment.videoFile
      );

      if (availableSegments.length === 0) {
        // 如果没有视频文件，生成字幕文件作为替代
        toast.info(
          "No video files available. Generating subtitle file instead."
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

      // 使用视频生成器生成视频
      const videoBlob = await videoGenerator.generateFromMultipleVideos(
        availableSegments,
        {
          outputFormat: "mp4",
          quality: "medium",
          includeTransitions: true,
          transitionDuration: 0.5,
          addSubtitles: true,
          subtitleStyle: "overlay",
          outputResolution: "720p",
        },
        (progress) => {
          console.log("Video generation progress:", progress);
        }
      );

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
                  Search Results for "{searchKeyword}"
                </h3>
                <p className="text-gray-600 mt-1">
                  Found {searchResults.matchedSubtitles} subtitles from{" "}
                  {searchResults.totalVideos} videos in{" "}
                  {searchResults.searchTime}ms
                </p>
              </div>
              <Button
                onClick={handleGenerateVideo}
                disabled={
                  isGenerating || searchResults.videoSegments.length === 0
                }
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Generate & Download
                  </>
                )}
              </Button>
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                        className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
