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
import { useRouter } from "next/navigation";
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
  FolderOpen,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { SubtitleDetectionDialog } from "@/components/subtitle-detection-dialog";
import { SubtitleVersionDialog } from "@/components/subtitle-version-dialog";
import { VerticalVideoGeneratorButton } from "@/components/vertical-video-generator-button";
import { TutorialSection } from "@/components/tutorial-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Plus, List } from "lucide-react";
import React from "react";

export default function HomePage() {
  const {
    currentVideo,
    setCurrentVideo,
    setSubtitles,
    setCurrentSubtitle,
    isLoadedFromMyList,
    setIsLoadedFromMyList,
  } = useAppStore();
  const router = useRouter();

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

  // Check if current project is in My List
  const checkMyListStatus = async () => {
    if (!currentVideo) return;

    try {
      const existingProject = await StorageManager.getMyLearningProject(
        currentVideo.id
      );
      // 如果从My List加载，或者项目已在My List中，都认为是"已添加"状态
      return !!existingProject || isLoadedFromMyList;
    } catch (error) {
      console.error("Error checking My List status:", error);
      return false;
    }
  };

  // Check My List status when video changes
  React.useEffect(() => {
    checkMyListStatus();
  }, [currentVideo]);

  const handleFileSelect = async (file: File, language: string) => {
    setIsProcessing(true);

    try {
      // Reset My List loading state for new file
      setIsLoadedFromMyList(false);

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
      let videoFileSaved = false;
      try {
        const { videoStorageService } = await import("@/lib/video-storage");
        await videoStorageService.saveVideoFile(file, video.id, {
          duration: video.duration,
        });
        console.log(`Video file saved to project directory: ${video.id}`);
        videoFileSaved = true;
      } catch (error) {
        console.error("Error saving video file:", error);
        toast.error(
          "Failed to save video file. Video generation may not work properly."
        );
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

    toast.success(`Switched to: ${version.versionName}`);
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
        `Smart subtitle segments generated! ${smartVersion.subtitles.length} segments created`
      );

      console.log("Auto generated smart subtitle version:", smartVersion);
      return true;
    } catch (error) {
      console.error("Error auto generating smart subtitle:", error);
      toast.error("Failed to generate smart subtitle segments");
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

  // Add current project to My List
  const handleAddToMyList = async () => {
    if (!currentVideo) {
      toast.error("No video loaded");
      return;
    }

    try {
      // Get current playback position
      const currentTime = videoPlayerRef?.getCurrentTime() || 0;

      // Check if already in My List
      const isAlreadyInList = await checkMyListStatus();

      // Create learning project data
      const learningProject = {
        videoId: currentVideo.id,
        videoName: currentVideo.name,
        videoPath: currentVideo.url, // For now, use URL as path
        subtitlePath: `subtitles_${currentVideo.id}`, // Subtitle identifier
        learningProgress: currentTime,
        addedTime: new Date(),
        projectName: currentVideo.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        description: `Language: ${
          currentVideo.language
        }, Duration: ${formatDuration(currentVideo.duration)}`,
        language: currentVideo.language,
        duration: currentVideo.duration,
        lastAccessed: new Date(),
      };

      // Save to database (this will update if exists, add if not)
      await StorageManager.saveMyLearningProject(learningProject);

      // Update local state
      setIsLoadedFromMyList(true);

      toast.success(
        isAlreadyInList ? "My List updated" : "Added to My Learning List"
      );
    } catch (error) {
      console.error("Failed to add to My List:", error);
      toast.error("Failed to add to My List");
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Navigate to My List
  const handleGoToMyList = () => {
    router.push("/my-list");
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

    // Check if API key is available
    const apiKey = localStorage.getItem("assemblyai_api_key");
    if (!apiKey) {
      // Show API key setup dialog
      const shouldSetup = confirm(
        "How to Get Your Free API Key\n\n" +
          "1. Visit AssemblyAI.com\n" +
          "2. Sign up for a free account (no credit card required)\n" +
          "3. Get $50 in free credits (approximately 50 hours of transcription)\n" +
          "4. Go to Dashboard → API Keys\n" +
          "5. Copy your API key and paste it in Settings\n\n" +
          "Would you like to open AssemblyAI.com in a new tab?"
      );

      if (shouldSetup) {
        window.open("https://www.assemblyai.com/", "_blank");
      }

      // Navigate to settings page
      router.push("/settings");
      return;
    }

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

            toast.success("Smart subtitle segments generated successfully!");
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
      <Navigation />

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
                  Master English with Any Video You Love
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Transform any video file into an interactive language learning
                  experience. Click subtitles to play, loop sentences, and build
                  your vocabulary naturally.
                  <strong className="text-blue-600">
                    {" "}
                    All processing happens locally on your device for complete
                    privacy.
                  </strong>
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
                  {/* {hasRawData && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-xs font-bold">
                            ✓
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-blue-800">
                            Raw Data Available
                          </h4>
                          <p className="text-xs text-blue-600 mt-1">
                            Original transcription data is already saved
                            locally, no need to re-transcribe
                          </p>
                        </div>
                      </div>
                    </div>
                  )} */}

                  {/* Auto Generation Progress */}
                  {isAutoGenerating && (
                    <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-purple-800">
                            Generating Smart Subtitles
                          </h4>
                          <p className="text-xs text-purple-600 mt-1">
                            Creating intelligent subtitle segments based on
                            sentence endings
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subtitle Processing Section */}
                  {!currentVideo.processed && !isLoadedFromMyList && (
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

                {/* My List Actions - Only show when video is loaded */}
                {currentVideo && (
                  <div className="education-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Learning Project Management
                      </h3>
                    </div>
                    <div className="flex space-x-4">
                      <Button
                        onClick={handleAddToMyList}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {isLoadedFromMyList
                          ? "Update My List"
                          : "Add to My List"}
                      </Button>
                      <Button
                        onClick={handleGoToMyList}
                        variant="outline"
                        className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <List className="w-4 h-4 mr-2" />
                        Go to My List
                      </Button>
                    </div>
                  </div>
                )}
                {!currentVideo && (
                  <div className="mt-2 p-2 bg-red-100 text-xs">
                    Debug: currentVideo is null, buttons hidden
                  </div>
                )}

                {/* Vertical Video Generator */}
                {/* {currentVideo.processed && hasRawData && (
                  <div className="mt-6 education-card overflow-hidden">
                    <VerticalVideoGeneratorButton
                      onVideoGenerated={(videoBlob) => {
                        console.log("Vertical video generated:", videoBlob);
                        toast.success("Vertical video generated successfully!");
                      }}
                    />
                  </div>
                )} */}
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

      {/* Footer - Only show when no video is loaded */}
      {!currentVideo ? (
        <>
          <TutorialSection />
          <TestimonialsSection />
          <Footer />
        </>
      ) : null}
    </div>
  );
}
