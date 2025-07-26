import { Subtitle } from "@/types/subtitle";

export interface WhisperOptions {
  model?: "tiny" | "base" | "small" | "medium" | "large";
  language?: string;
  task?: "transcribe" | "translate";
  temperature?: number;
  maxTokens?: number;
  chunkLength?: number;
  overlap?: number;
}

export interface WhisperResult {
  segments: Subtitle[];
  language: string;
  duration: number;
  confidence: number;
}

export interface ProcessingProgress {
  stage: "loading" | "processing" | "completed" | "error";
  progress: number; // 0-100
  message: string;
  currentSegment?: number;
  totalSegments?: number;
}

export class WhisperClient {
  private isLoaded = false;
  private progressCallback?: (progress: ProcessingProgress) => void;

  async initialize(options: WhisperOptions = {}): Promise<void> {
    if (this.isLoaded) return;

    try {
      this.updateProgress({
        stage: "loading",
        progress: 0,
        message: "Loading Whisper model...",
      });

      // For now, we'll use a simplified approach
      // In a real implementation, you would initialize whisper-turbo here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading

      this.isLoaded = true;
      this.updateProgress({
        stage: "loading",
        progress: 100,
        message: "Whisper model loaded successfully",
      });

      console.log("Whisper loaded successfully");
    } catch (error) {
      console.error("Failed to load Whisper:", error);
      this.updateProgress({
        stage: "error",
        progress: 0,
        message: "Failed to load Whisper model",
      });
      throw new Error("Failed to initialize Whisper client");
    }
  }

  async transcribeAudio(
    audioBlob: Blob,
    videoId: string,
    language: string,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<WhisperResult> {
    if (!this.isLoaded) {
      await this.initialize({ language });
    }

    this.progressCallback = onProgress;

    try {
      this.updateProgress({
        stage: "processing",
        progress: 0,
        message: "Starting transcription...",
      });

      // Simulate transcription process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      this.updateProgress({
        stage: "processing",
        progress: 50,
        message: "Processing audio...",
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create mock segments for demonstration
      const segments: Subtitle[] = [
        {
          id: `${videoId}_segment_0`,
          text: "Hello, this is a sample transcription.",
          start: 0,
          end: 3,
          confidence: 0.95,
          language,
          videoId,
        },
        {
          id: `${videoId}_segment_1`,
          text: "The speech recognition is working.",
          start: 3,
          end: 6,
          confidence: 0.88,
          language,
          videoId,
        },
        {
          id: `${videoId}_segment_2`,
          text: "This is just a demonstration.",
          start: 6,
          end: 9,
          confidence: 0.92,
          language,
          videoId,
        },
      ];

      this.updateProgress({
        stage: "completed",
        progress: 100,
        message: "Transcription completed",
      });

      return {
        segments,
        language,
        duration: segments.length > 0 ? segments[segments.length - 1].end : 0,
        confidence:
          segments.reduce((acc, seg) => acc + seg.confidence, 0) /
            segments.length || 0.8,
      };
    } catch (error) {
      console.error("Error transcribing audio:", error);
      this.updateProgress({
        stage: "error",
        progress: 0,
        message: "Transcription failed",
      });
      throw new Error("Failed to transcribe audio");
    }
  }

  async transcribeVideo(
    videoFile: File,
    videoId: string,
    language: string,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<WhisperResult> {
    try {
      this.updateProgress({
        stage: "processing",
        progress: 0,
        message: "Extracting audio from video...",
      });

      // Import audio processor dynamically to avoid circular dependencies
      const { audioProcessor } = await import("./audio-processor");

      // Extract audio from video
      const audioResult = await audioProcessor.extractAudioFromVideo(
        videoFile,
        {
          format: "wav",
          sampleRate: 16000,
          channels: 1,
        }
      );

      this.updateProgress({
        stage: "processing",
        progress: 5,
        message: "Audio extracted, starting transcription...",
      });

      // Transcribe the extracted audio
      return await this.transcribeAudio(
        audioResult.audioBlob,
        videoId,
        language,
        onProgress
      );
    } catch (error) {
      console.error("Error transcribing video:", error);
      this.updateProgress({
        stage: "error",
        progress: 0,
        message: "Video transcription failed",
      });
      throw new Error("Failed to transcribe video");
    }
  }

  private updateProgress(progress: ProcessingProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  async cleanup(): Promise<void> {
    this.isLoaded = false;
  }

  // Get available models
  getAvailableModels(): string[] {
    return ["tiny", "base", "small", "medium", "large"];
  }

  // Get model size in MB (approximate)
  getModelSize(model: string): number {
    const sizes: Record<string, number> = {
      tiny: 39,
      base: 74,
      small: 244,
      medium: 769,
      large: 1550,
    };
    return sizes[model] || 74;
  }
}

// Singleton instance
export const whisperClient = new WhisperClient();
