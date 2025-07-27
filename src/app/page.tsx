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
import { useVocabulary } from "@/hooks/use-vocabulary";
import { Video } from "@/types/video";
import { Subtitle } from "@/types/subtitle";
import { Button } from "@/components/ui/button";
import { BookOpen, Settings, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { SubtitleDetectionDialog } from "@/components/subtitle-detection-dialog";

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

  const handleFileSelect = async (file: File, language: string) => {
    setIsProcessing(true);

    try {
      // Create video object
      const video: Video = {
        id: Date.now().toString(),
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

      // Store the file for later transcription
      setCurrentVideo({ ...video, file });

      // Check for existing subtitle records
      await checkForExistingSubtitles(video);
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

      // Save subtitles to local storage
      await StorageManager.saveSubtitles(result.segments);

      // Update video as processed
      const updatedVideo = { ...currentVideo, processed: true };
      setCurrentVideo(updatedVideo);
      await StorageManager.saveVideo(updatedVideo);

      // Set subtitles in store
      setSubtitles(result.segments);

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Language Learning Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/vocabulary">
                <Button variant="outline" size="sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Vocabulary
                </Button>
              </Link>
              <Link href="/subtitles">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Subtitles
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!currentVideo ? (
          // Upload Screen
          <div className="flex flex-col items-center justify-center min-h-[600px]">
            {/* 
              FIX: Added `relative` and `z-10` here.
              This creates a new stacking context and lifts this entire section (and its children, like dropdowns)
              above other elements on the page, fixing the "hollow" or "see-through" issue with the dropdown menu.
            */}
            <div className="text-center space-y-6 relative z-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Start Learning with Video
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Upload a video file and we'll automatically generate subtitles
                  to help you learn the language. Support for multiple languages
                  and formats.
                </p>
              </div>

              <FileUpload onFileSelect={handleFileSelect} />

              {/* Fallback processing indicator */}
              {isProcessing && !isTranscribing && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-800">Processing video...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Main Learning Interface
          <div className="space-y-6">
            {/* Video Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Video Player */}
              <div className="col-span-1 md:col-span-8">
                <div className="bg-black rounded-lg overflow-hidden w-full aspect-video">
                  <VideoPlayer
                    url={currentVideo.url}
                    onProgress={handleVideoProgress}
                    onDuration={handleDurationUpdate}
                    onRef={setVideoPlayerRef}
                  />
                </div>

                {/* Video Info */}
                <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {currentVideo.name}
                  </h3>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>Language: {currentVideo.language}</span>
                    <span>
                      Duration: {Math.floor(currentVideo.duration / 60)}m{" "}
                      {Math.round(currentVideo.duration % 60)}s
                    </span>
                    <span>
                      Size: {(currentVideo.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>

                  {/* Subtitle Processing Section */}
                  {!currentVideo.processed && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Subtitle Processing
                      </h4>
                      <SubtitleProcessor
                        videoId={currentVideo.id}
                        language={currentVideo.language}
                        onSubtitlesLoaded={handleSubtitlesLoaded}
                        onAutoTranscribe={handleAutoTranscribe}
                        isTranscribing={isTranscribing}
                      />
                    </div>
                  )}

                  {/* Transcription Progress */}
                  {(isTranscribing || transcriptionProgress) && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
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
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                      {transcriptionProgress && (
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <LearningPanel
                    onPlaySegment={handlePlaySegment}
                    onAddToVocabulary={handleAddToVocabulary}
                  />
                </div>
              </div>

              {/* Subtitles Panel */}
              <div className="col-span-1 md:col-span-4">
                <div
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
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
      </main>
    </div>
  );
}
