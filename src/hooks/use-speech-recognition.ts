import { useState, useCallback, useRef } from "react";
import {
  whisperClient,
  ProcessingProgress,
  WhisperResult,
} from "@/lib/whisper-client";
import { Subtitle } from "@/types/subtitle";
import { useAppStore } from "@/lib/store";

export interface SpeechRecognitionState {
  isProcessing: boolean;
  progress: ProcessingProgress | null;
  error: string | null;
  result: WhisperResult | null;
}

export interface SpeechRecognitionOptions {
  model?: "tiny" | "base" | "small" | "medium" | "large";
  language?: string;
  onProgress?: (progress: ProcessingProgress) => void;
  onComplete?: (result: WhisperResult) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechRecognitionState>({
    isProcessing: false,
    progress: null,
    error: null,
    result: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const { setSubtitles, setCurrentVideo } = useAppStore();

  const resetState = useCallback(() => {
    setState({
      isProcessing: false,
      progress: null,
      error: null,
      result: null,
    });
  }, []);

  const handleProgress = useCallback((progress: ProcessingProgress) => {
    setState((prev) => ({
      ...prev,
      progress,
      error: progress.stage === "error" ? progress.message : null,
    }));
  }, []);

  const handleComplete = useCallback((result: WhisperResult) => {
    setState((prev) => ({
      ...prev,
      isProcessing: false,
      progress: {
        stage: "completed",
        progress: 100,
        message: "Transcription completed successfully",
      },
      result,
    }));
  }, []);

  const handleError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      isProcessing: false,
      progress: {
        stage: "error",
        progress: 0,
        message: error,
      },
      error,
    }));
  }, []);

  const transcribeVideo = useCallback(
    async (
      videoFile: File,
      videoId: string,
      language: string,
      options: SpeechRecognitionOptions = {}
    ) => {
      try {
        // Reset state
        resetState();
        setState((prev) => ({ ...prev, isProcessing: true }));

        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        // Initialize whisper client
        await whisperClient.initialize({
          model: options.model || "base",
          language: options.language || language,
        });

        // Start transcription
        const result = await whisperClient.transcribeVideo(
          videoFile,
          videoId,
          language,
          (progress) => {
            handleProgress(progress);
            options.onProgress?.(progress);
          }
        );

        // Update app state with subtitles
        setSubtitles(result.segments);

        // Update video processing status - we need to get current video from store
        const currentVideo = useAppStore.getState().currentVideo;
        if (currentVideo) {
          setCurrentVideo({ ...currentVideo, processed: true });
        }

        // Call completion callback
        handleComplete(result);
        options.onComplete?.(result);

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        handleError(errorMessage);
        options.onError?.(errorMessage);
        throw error;
      }
    },
    [
      resetState,
      handleProgress,
      handleComplete,
      handleError,
      setSubtitles,
      setCurrentVideo,
    ]
  );

  const transcribeAudio = useCallback(
    async (
      audioBlob: Blob,
      videoId: string,
      language: string,
      options: SpeechRecognitionOptions = {}
    ) => {
      try {
        // Reset state
        resetState();
        setState((prev) => ({ ...prev, isProcessing: true }));

        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        // Initialize whisper client
        await whisperClient.initialize({
          model: options.model || "base",
          language: options.language || language,
        });

        // Start transcription
        const result = await whisperClient.transcribeAudio(
          audioBlob,
          videoId,
          language,
          (progress) => {
            handleProgress(progress);
            options.onProgress?.(progress);
          }
        );

        // Update app state with subtitles
        setSubtitles(result.segments);

        // Call completion callback
        handleComplete(result);
        options.onComplete?.(result);

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        handleError(errorMessage);
        options.onError?.(errorMessage);
        throw error;
      }
    },
    [resetState, handleProgress, handleComplete, handleError, setSubtitles]
  );

  const cancelTranscription = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isProcessing: false,
      progress: {
        stage: "error",
        progress: 0,
        message: "Transcription cancelled",
      },
      error: "Transcription cancelled",
    }));
  }, []);

  const getAvailableModels = useCallback(() => {
    return whisperClient.getAvailableModels();
  }, []);

  const getModelSize = useCallback((model: string) => {
    return whisperClient.getModelSize(model);
  }, []);

  return {
    // State
    isProcessing: state.isProcessing,
    progress: state.progress,
    error: state.error,
    result: state.result,

    // Actions
    transcribeVideo,
    transcribeAudio,
    cancelTranscription,
    resetState,

    // Utilities
    getAvailableModels,
    getModelSize,
  };
}
