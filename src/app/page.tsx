"use client";

import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { VideoPlayer } from "@/components/video-player";
import { SubtitleList } from "@/components/subtitle-list";
import { LearningPanel } from "@/components/learning-panel";
import { TranscriptionProgress } from "@/components/transcription-progress";
import { useAppStore } from "@/lib/store";
import { StorageManager } from "@/lib/storage";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { Video } from "@/types/video";
import { Subtitle } from "@/types/subtitle";
import { VocabularyItem } from "@/types/vocabulary";
import { Button } from "@/components/ui/button";
import { BookOpen, Settings, BookText } from "lucide-react";
import Link from "next/link";
import { VocabularyLearning } from "@/components/vocabulary-learning";

export default function HomePage() {
  const {
    currentVideo,
    setCurrentVideo,
    setSubtitles,
    setCurrentSubtitle,
    addVocabularyItem,
  } = useAppStore();

  const [isProcessing, setIsProcessing] = useState(false);

  // Speech recognition hook
  const {
    isProcessing: isTranscribing,
    progress: transcriptionProgress,
    error: transcriptionError,
    transcribeVideo,
    cancelTranscription,
  } = useSpeechRecognition();

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

      // Start speech recognition
      const result = await transcribeVideo(file, video.id, language, {
        model: "base", // Use base model for better accuracy
        onComplete: async (whisperResult) => {
          // Save subtitles to local storage
          await StorageManager.saveSubtitles(whisperResult.segments);

          // Update video as processed
          const updatedVideo = { ...video, processed: true };
          setCurrentVideo(updatedVideo);
          await StorageManager.saveVideo(updatedVideo);
        },
        onError: (error) => {
          console.error("Transcription error:", error);
          // Keep video but mark as not processed
          setCurrentVideo({ ...video, processed: false });
        },
      });
    } catch (error) {
      console.error("Error processing video:", error);
      // If transcription fails, still show the video but without subtitles
      const currentVideo = useAppStore.getState().currentVideo;
      if (currentVideo) {
        setCurrentVideo({ ...currentVideo, processed: false });
      }
    } finally {
      setIsProcessing(false);
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
    // TODO: Implement segment playback
    console.log("Play segment:", start, end);
  };

  const handleAddToVocabulary = async (word: string, context: string) => {
    // This function is now handled by the useVocabulary hook
    // The new vocabulary system will handle dictionary lookups automatically
    console.log("Adding word to vocabulary:", word, context);
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

              {/* Transcription Progress */}
              {(isTranscribing || transcriptionProgress) && (
                <div className="mt-4">
                  <TranscriptionProgress
                    progress={transcriptionProgress}
                    onCancel={cancelTranscription}
                  />
                </div>
              )}

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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column - Video Player */}
            <div className="col-span-1 md:col-span-8 flex flex-col">
              {/* 
                IMPROVEMENT: Replaced fixed height with `aspect-video`.
                This makes the video player responsive and maintains a 16:9 aspect ratio.
              */}
              <div className="bg-black rounded-lg overflow-hidden w-full aspect-video">
                <VideoPlayer
                  url={currentVideo.url}
                  onProgress={handleVideoProgress}
                  onDuration={handleDurationUpdate}
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
              </div>
            </div>

            {/* Right Column - Subtitles and Learning Panel */}
            <div className="col-span-1 md:col-span-4 flex flex-col space-y-6">
              <div
                className="bg-white rounded-lg shadow-sm overflow-hidden"
                style={{ height: "300px" }}
              >
                <SubtitleList
                  onSubtitleClick={(subtitle) => setCurrentSubtitle(subtitle)}
                  onPlaySegment={handlePlaySegment}
                />
              </div>
              <div
                className="bg-white rounded-lg shadow-sm overflow-hidden"
                style={{ height: "200px" }}
              >
                <LearningPanel
                  onPlaySegment={handlePlaySegment}
                  onAddToVocabulary={handleAddToVocabulary}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
