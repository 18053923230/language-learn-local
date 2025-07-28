"use client";

import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { VideoPlayer, VideoPlayerRef } from "@/components/video-player";
import { SubtitleList } from "@/components/subtitle-list";
import { LearningPanel } from "@/components/learning-panel";

import { SubtitleProcessor } from "@/components/subtitle-processor";
import { useAppStore } from "@/lib/store";
import { StorageManager } from "@/lib/storage";
import { assemblyAIService } from "@/lib/assemblyai-service";
import { subtitleStorage, SubtitleRecord } from "@/lib/subtitle-storage";
import { rawTranscriptionStorage } from "@/lib/raw-transcription-storage";
import { subtitleVersionStorage } from "@/lib/subtitle-version-storage";
import { useVocabulary } from "@/hooks/use-vocabulary";
import { Video } from "@/types/video";
import { Subtitle } from "@/types/subtitle";
import { SubtitleVersion } from "@/types/subtitle-version";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Settings,
  Download,
  Search,
  Video as VideoIcon,
  HardDrive,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { SubtitleDetectionDialog } from "@/components/subtitle-detection-dialog";
import { SubtitleVersionDialog } from "@/components/subtitle-version-dialog";

export default function HomePage() {
  const { currentVideo, setCurrentVideo, setSubtitles, setCurrentSubtitle } =
    useAppStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState<any>(null);
  const [videoPlayerRef, setVideoPlayerRef] = useState<VideoPlayerRef | null>(
    null
  );
  const [detectedRecord, setDetectedRecord] = useState<SubtitleRecord | null>(
    null
  );
  const [isDetectionDialogOpen, setIsDetectionDialogOpen] = useState(false);
  const [isExactMatch, setIsExactMatch] = useState(false);
  const [hasRawData, setHasRawData] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [availableVersions, setAvailableVersions] = useState<SubtitleVersion[]>(
    []
  );
  const [currentVersion, setCurrentVersion] = useState<SubtitleVersion | null>(
    null
  );
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  const handleFileSelect = async (file: File, language: string) => {
    setIsProcessing(true);

    try {
      // Create video object with consistent ID format
      const video: Video = {
        id: `api-transcript-${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        duration: 0, // Will be set when video loads
        size: file.size,
        format: file.name.split(".").pop() || "",
        language,
        uploadedAt: new Date(),
        processed: false,
      };

      setCurrentVideo(video);

      // Save video to local storage first
      await StorageManager.saveVideo(video);
      await StorageManager.saveVideoCache({
        videoId: video.id,
        videoName: video.name,
        url: video.url,
        size: video.size,
        format: video.format,
        language: video.language,
        cachedAt: new Date(),
        lastAccessed: new Date(),
      });

      // 保存视频文件到项目目录
      try {
        const { videoStorageService } = await import("@/lib/video-storage");
        await videoStorageService.saveVideoFile(file, video.id, {
          duration: video.duration,
        });
        console.log(`Video file saved to project directory: ${video.id}`);
      } catch (error) {
        console.error("Error saving video file:", error);
        // 即使保存失败，也继续处理视频
      }

      // Store the file for later transcription
      setCurrentVideo({ ...video, file });

      // Check for existing subtitle records and raw data
      await checkForExistingSubtitles(video);
      await checkForExistingRawData(video);

      // 检查是否有现有字幕版本
      const hasExistingVersions = await checkForExistingVersions(video);

      // 如果有原始数据但没有字幕版本，自动生成智能分段字幕
      if (hasRawData && !hasExistingVersions) {
        console.log(
          "Raw data exists but no subtitle versions found, auto generating..."
        );
        console.log("Video info:", {
          id: video.id,
          name: video.name,
          size: video.size,
          language: video.language,
        });
        await autoGenerateSmartSubtitle(video);
      } else {
        console.log("Auto generation conditions not met:", {
          hasRawData,
          hasExistingVersions,
          videoId: video.id,
        });
      }
    } catch (error) {
      console.error("Error processing video:", error);
      // If processing fails, still show the video but without subtitles
      const currentVideo = useAppStore.getState().currentVideo;
      if (currentVideo) {
        setCurrentVideo({ ...currentVideo, processed: false });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Check for existing subtitle records
  const checkForExistingSubtitles = async (video: Video) => {
    try {
      // Check for exact video match first
      const existingRecord = await subtitleStorage.getSubtitleRecordByVideoId(
        video.id
      );

      if (existingRecord) {
        // Found exact match, show dialog
        setDetectedRecord(existingRecord);
        setIsExactMatch(true);
        setIsDetectionDialogOpen(true);
        return;
      }

      // Check for similar video (same hash)
      const similarRecord = await subtitleStorage.hasSimilarVideoRecord(video);

      if (similarRecord) {
        // Found similar video, show dialog
        setDetectedRecord(similarRecord);
        setIsExactMatch(false);
        setIsDetectionDialogOpen(true);
      }
    } catch (error) {
      console.error("Error checking for existing subtitles:", error);
    }
  };

  // Check for existing raw data
  const checkForExistingRawData = async (video: Video) => {
    try {
      // Check for exact video match first
      const existingRawData = await rawTranscriptionStorage.getRawData(
        video.id
      );

      if (existingRawData) {
        setHasRawData(true);
        console.log("Found existing raw data for video:", video.id);
        return;
      }

      // Check all raw data for similar videos (by file name and size)
      const allRawData = await rawTranscriptionStorage.getAllRawData();

      const similarRawData = allRawData.find((rawData) => {
        // 基于文件名和大小的精确匹配
        return (
          rawData.metadata.fileName === video.name &&
          rawData.metadata.fileSize === video.size &&
          rawData.language === video.language
        );
      });

      if (similarRawData) {
        setHasRawData(true);
        console.log(
          "Found similar raw data for video:",
          video.id,
          "matching:",
          similarRawData.videoId
        );
        return;
      }

      // If no raw data found, ensure the state is false
      setHasRawData(false);
    } catch (error) {
      console.error("Error checking for existing raw data:", error);
      setHasRawData(false);
    }
  };

  // Check for existing subtitle versions
  const checkForExistingVersions = async (video: Video) => {
    try {
      const versions = await subtitleVersionStorage.getVersionsByVideoId(
        video.id
      );

      if (versions.length > 0) {
        setAvailableVersions(versions);

        // 找到默认版本或第一个版本
        const defaultVersion = versions.find((v) => v.isDefault) || versions[0];
        setCurrentVersion(defaultVersion);

        // 如果有多个版本，显示选择对话框
        if (versions.length > 1) {
          setIsVersionDialogOpen(true);
        } else {
          // 只有一个版本，直接加载
          setSubtitles(defaultVersion.subtitles);
        }

        console.log("Found existing subtitle versions for video:", video.id);
        return true; // 表示找到了现有版本
      }

      return false; // 表示没有找到现有版本
    } catch (error) {
      console.error("Error checking for existing versions:", error);
      return false;
    }
  };

  // Handle loading subtitles from detected record
  const handleLoadDetectedSubtitles = async () => {
    if (!detectedRecord || !currentVideo) return;

    try {
      setSubtitles(detectedRecord.subtitles);
      setCurrentVideo({ ...currentVideo, processed: true });

      // If it's not an exact match, update the video ID
      if (!isExactMatch) {
        await subtitleStorage.updateVideoId(detectedRecord.id, currentVideo.id);
      }

      // Check if this video has raw data
      await checkForExistingRawData(currentVideo);

      // 检查是否有现有字幕版本，如果没有但有原始数据，自动生成
      const hasExistingVersions = await checkForExistingVersions(currentVideo);
      if (hasRawData && !hasExistingVersions) {
        console.log(
          "Raw data exists but no subtitle versions found, auto generating..."
        );
        await autoGenerateSmartSubtitle(currentVideo);
      }

      toast.success(
        isExactMatch
          ? "Loaded existing subtitles"
          : "Linked existing subtitles to current video"
      );
    } catch (error) {
      console.error("Error loading subtitles:", error);
      toast.error("Failed to load subtitles");
    }
  };

  // Handle subtitle version selection
  const handleSelectSubtitleVersion = (version: SubtitleVersion) => {
    setCurrentVersion(version);
    setSubtitles(version.subtitles);
    setIsVersionDialogOpen(false);

    toast.success(`已切换到: ${version.versionName}`);
  };

  // Auto generate smart subtitle version from raw data
  const autoGenerateSmartSubtitle = async (video: Video) => {
    setIsAutoGenerating(true);
    try {
      // 获取原始数据
      const rawData = await rawTranscriptionStorage.getRawData(video.id);

      if (!rawData) {
        console.warn("No raw data found for auto generation");
        return false;
      }

      // 生成智能分段字幕版本
      const smartVersion =
        await subtitleVersionStorage.createSmartVersionFromRawData(
          video.id,
          rawData
        );

      // 保存到本地存储
      await StorageManager.saveSubtitles(smartVersion.subtitles);

      // 同时保存到字幕记录存储
      await subtitleStorage.saveSubtitleRecord(
        video,
        smartVersion.subtitles,
        "assemblyai"
      );

      // 设置为当前版本和字幕
      setCurrentVersion(smartVersion);
      setSubtitles(smartVersion.subtitles);
      setAvailableVersions([smartVersion]);

      toast.success(
        `已自动生成智能分段字幕！共 ${smartVersion.subtitles.length} 个段落`
      );

      console.log("Auto generated smart subtitle version:", smartVersion);
      return true;
    } catch (error) {
      console.error("Error auto generating smart subtitle:", error);
      toast.error("自动生成智能分段字幕失败");
      return false;
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleVideoProgress = (currentTime: number) => {
    const subtitles = useAppStore.getState().subtitles;
    const currentSubtitle = subtitles.find(
      (subtitle) => currentTime >= subtitle.start && currentTime <= subtitle.end
    );

    if (currentSubtitle) {
      setCurrentSubtitle(currentSubtitle);
    }

    if (currentVideo && Math.floor(currentTime) % 5 === 0) {
      StorageManager.savePlayHistory({
        videoId: currentVideo.id,
        videoName: currentVideo.name,
        currentTime,
        duration: currentVideo.duration,
        lastPlayed: new Date(),
        playCount: 1,
      }).catch((error) => {
        console.error("Error saving play history:", error);
      });
    }
  };

  const handleDurationUpdate = (duration: number) => {
    if (currentVideo && currentVideo.duration !== duration) {
      const updatedVideo = { ...currentVideo, duration };
      setCurrentVideo(updatedVideo);
    }
  };

  const handlePlaySegment = (start: number, end: number) => {
    if (videoPlayerRef) {
      videoPlayerRef.playSegment(start, end);
    } else {
      console.log("Video player not ready, play segment:", start, end);
    }
  };

  // 使用 useVocabulary hook
  const { addWord } = useVocabulary();

  const handleAddToVocabulary = async (word: string) => {
    try {
      await addWord(word);
      console.log("Successfully added word to vocabulary:", word);
    } catch (error) {
      console.error("Failed to add word to vocabulary:", error);
    }
  };

  const handleSubtitlesLoaded = async (subtitles: Subtitle[]) => {
    if (!currentVideo) return;

    try {
      // Save subtitles to local storage
      await StorageManager.saveSubtitles(subtitles);

      // Update video as processed
      const updatedVideo = { ...currentVideo, processed: true };
      setCurrentVideo(updatedVideo);
      await StorageManager.saveVideo(updatedVideo);

      // Set subtitles in store
      setSubtitles(subtitles);

      // 提示用户保存字幕到本地数据库
      console.log(
        "Subtitles loaded, you can click the save button to save them to local database"
      );
    } catch (error) {
      console.error("Error saving subtitles:", error);
    }
  };

  const handleAutoTranscribe = async () => {
    if (!currentVideo || !currentVideo.file) return;

    setIsTranscribing(true);
    setTranscriptionProgress(null);

    try {
      // Initialize AssemblyAI service
      await assemblyAIService.initialize(currentVideo.language);

      // Start transcription with AssemblyAI
      const result = await assemblyAIService.transcribeAudio(
        currentVideo.file,
        currentVideo.id,
        currentVideo.language,
        (progress: any) => {
          setTranscriptionProgress(progress);
          console.log("AssemblyAI transcription progress:", progress);
        }
      );

      // Save raw transcription data
      if (result.rawData) {
        try {
          await rawTranscriptionStorage.saveRawData(result.rawData);
          console.log("Raw transcription data saved successfully");
          setHasRawData(true); // Update state after successful save

          // 自动生成智能分段字幕版本
          try {
            const smartVersion =
              await subtitleVersionStorage.createSmartVersionFromRawData(
                result.rawData.videoId,
                result.rawData
              );
            console.log("Smart subtitle version created:", smartVersion);

            // 使用智能分段字幕作为默认显示
            setSubtitles(smartVersion.subtitles);

            // 保存到本地存储
            await StorageManager.saveSubtitles(smartVersion.subtitles);

            // 同时保存到字幕记录存储
            await subtitleStorage.saveSubtitleRecord(
              currentVideo,
              smartVersion.subtitles,
              "assemblyai"
            );

            toast.success("智能分段字幕生成成功！");
          } catch (versionError) {
            console.error("Error creating smart version:", versionError);
            // 如果智能版本创建失败，使用原始字幕
            setSubtitles(result.segments);
            await StorageManager.saveSubtitles(result.segments);
          }
        } catch (error) {
          console.error("Error saving raw data:", error);
          // Continue with subtitle processing even if raw data save fails
          setSubtitles(result.segments);
          await StorageManager.saveSubtitles(result.segments);
        }
      } else {
        // 如果没有原始数据，使用原始字幕
        setSubtitles(result.segments);
        await StorageManager.saveSubtitles(result.segments);
      }

      // Update video as processed
      const updatedVideo = { ...currentVideo, processed: true };
      setCurrentVideo(updatedVideo);
      await StorageManager.saveVideo(updatedVideo);

      console.log("AssemblyAI transcription completed:", result);
    } catch (error: any) {
      console.error("Transcription error:", error);
      // Keep video but mark as not processed
      setCurrentVideo({ ...currentVideo, processed: false });
    } finally {
      setIsTranscribing(false);
      setTranscriptionProgress(null);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Language Learning Platform
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/vocabulary">
                <Button
                  variant="outline"
                  size="sm"
                  className="education-button-secondary"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Vocabulary
                </Button>
              </Link>
              <Link href="/subtitles">
                <Button
                  variant="outline"
                  size="sm"
                  className="education-button-secondary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Subtitles
                </Button>
              </Link>
              <Link href="/video-search">
                <Button
                  variant="outline"
                  size="sm"
                  className="education-button-secondary"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Video Search
                </Button>
              </Link>
              <Link href="/video-management">
                <Button
                  variant="outline"
                  size="sm"
                  className="education-button-secondary"
                >
                  <HardDrive className="w-4 h-4 mr-2" />
                  Video Management
                </Button>
              </Link>
              <Link href="/performance-monitor">
                <Button
                  variant="outline"
                  size="sm"
                  className="education-button-secondary"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Performance
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  variant="outline"
                  size="sm"
                  className="education-button-secondary"
                >
                  <VideoIcon className="w-4 h-4 mr-2" />
                  Demo
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentVideo ? (
          // Upload Screen
          <div className="flex flex-col items-center justify-center min-h-[600px]">
            <div className="text-center space-y-8 relative z-10">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white text-2xl font-bold">🎬</span>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Start Learning with Video
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Upload a video file and we'll automatically generate subtitles
                  to help you learn the language. Support for multiple languages
                  and formats.
                </p>
              </div>

              <div className="education-card p-10 max-w-lg mx-auto">
                <FileUpload onFileSelect={handleFileSelect} />
              </div>

              {/* Fallback processing indicator */}
              {isProcessing && !isTranscribing && (
                <div className="education-card p-6 max-w-md mx-auto">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-blue-800 font-medium">
                      Processing video...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Main Learning Interface
          <div className="space-y-8">
            {/* Video Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Video Player */}
              <div className="col-span-1 md:col-span-8">
                <div className="education-card overflow-hidden w-full aspect-video">
                  <VideoPlayer
                    url={currentVideo.url}
                    onProgress={handleVideoProgress}
                    onDuration={handleDurationUpdate}
                    onRef={setVideoPlayerRef}
                  />
                </div>

                {/* Video Info */}
                <div className="mt-6 education-card p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 truncate">
                    {currentVideo.name}
                  </h3>
                  <div className="flex items-center flex-wrap gap-4 text-sm">
                    <span className="education-badge education-badge-info">
                      Language: {currentVideo.language}
                    </span>
                    <span className="education-badge education-badge-info">
                      Duration: {Math.floor(currentVideo.duration / 60)}m{" "}
                      {Math.round(currentVideo.duration % 60)}s
                    </span>
                    <span className="education-badge education-badge-info">
                      Size: {(currentVideo.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>

                  {/* Raw Data Status */}
                  {hasRawData && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-xs font-bold">
                            ✓
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-blue-800">
                            原始数据已存在
                          </h4>
                          <p className="text-xs text-blue-600 mt-1">
                            此视频的原始转录数据已保存在本地，无需重复转录
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Auto Generation Progress */}
                  {isAutoGenerating && (
                    <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-purple-800">
                            正在自动生成智能分段字幕
                          </h4>
                          <p className="text-xs text-purple-600 mt-1">
                            基于原始数据生成基于句末标点的智能分段字幕
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subtitle Processing Section */}
                  {!currentVideo.processed && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-xs font-bold">
                            S
                          </span>
                        </span>
                        Subtitle Processing
                      </h4>
                      <SubtitleProcessor
                        videoId={currentVideo.id}
                        language={currentVideo.language}
                        onSubtitlesLoaded={handleSubtitlesLoaded}
                        onAutoTranscribe={handleAutoTranscribe}
                        isTranscribing={isTranscribing}
                        hasRawData={hasRawData}
                      />
                    </div>
                  )}

                  {/* Transcription Progress */}
                  {(isTranscribing || transcriptionProgress) && (
                    <div className="mt-6 education-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          <span className="text-blue-800 font-medium">
                            {transcriptionProgress?.message ||
                              "Transcribing..."}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setIsTranscribing(false);
                            setTranscriptionProgress(null);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                      {transcriptionProgress && (
                        <div className="education-progress h-3">
                          <div
                            className="education-progress-bar"
                            style={{
                              width: `${transcriptionProgress.progress}%`,
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Learning Panel - Below Video */}
                <div className="education-card overflow-hidden">
                  <LearningPanel
                    onPlaySegment={handlePlaySegment}
                    onAddToVocabulary={handleAddToVocabulary}
                  />
                </div>
              </div>

              {/* Subtitles Panel */}
              <div className="col-span-1 md:col-span-4">
                <div
                  className="education-card overflow-hidden"
                  style={{ height: "1200px" }}
                >
                  <SubtitleList
                    onSubtitleClick={(subtitle) => setCurrentSubtitle(subtitle)}
                    onPlaySegment={handlePlaySegment}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subtitle Detection Dialog */}
        {detectedRecord && (
          <SubtitleDetectionDialog
            isOpen={isDetectionDialogOpen}
            onClose={() => {
              setIsDetectionDialogOpen(false);
              setDetectedRecord(null);
            }}
            onLoadSubtitles={handleLoadDetectedSubtitles}
            record={detectedRecord}
            isExactMatch={isExactMatch}
          />
        )}

        {/* Subtitle Version Dialog */}
        <SubtitleVersionDialog
          isOpen={isVersionDialogOpen}
          onClose={() => setIsVersionDialogOpen(false)}
          versions={availableVersions}
          currentVersion={currentVersion || undefined}
          onSelectVersion={handleSelectSubtitleVersion}
          videoName={currentVideo?.name || ""}
        />
      </main>
    </div>
  );
}
