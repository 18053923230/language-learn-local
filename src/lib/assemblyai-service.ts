import { Subtitle } from "@/types/subtitle";

import { RawTranscriptionData } from "@/types/raw-transcription";

export interface AssemblyAIResult {
  segments: Subtitle[];
  language: string;
  duration: number;
  confidence: number;
  rawData?: RawTranscriptionData;
}

export interface ProcessingProgress {
  stage: "loading" | "processing" | "completed" | "error";
  progress: number; // 0-100
  message: string;
  currentSegment?: number;
  totalSegments?: number;
}

export class AssemblyAIService {
  private isInitialized = false;
  private progressCallback?: (progress: ProcessingProgress) => void;

  constructor() {
    // API key is now handled server-side
  }

  async initialize(language: string = "en"): Promise<void> {
    if (this.isInitialized) return;

    this.updateProgress({
      stage: "loading",
      progress: 0,
      message: "Initializing AssemblyAI service...",
    });

    try {
      this.isInitialized = true;
      this.updateProgress({
        stage: "loading",
        progress: 100,
        message: "AssemblyAI service initialized successfully",
      });

      console.log("AssemblyAI service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize AssemblyAI service:", error);
      throw new Error("Failed to initialize AssemblyAI service");
    }
  }

  async transcribeAudio(
    audioBlob: Blob,
    videoId: string,
    language: string,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<AssemblyAIResult> {
    if (!this.isInitialized) {
      await this.initialize(language);
    }

    this.progressCallback = onProgress;

    this.updateProgress({
      stage: "processing",
      progress: 10,
      message: "Preparing audio for transcription...",
    });

    try {
      this.updateProgress({
        stage: "processing",
        progress: 20,
        message: "Uploading audio to server...",
      });

      // Get API key from localStorage
      const apiKey = localStorage.getItem("assemblyai_api_key");

      // Create FormData for upload
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("language", language);

      // Only append API key if it exists, otherwise let the server use environment variable
      if (apiKey) {
        formData.append("apiKey", apiKey);
      }

      this.updateProgress({
        stage: "processing",
        progress: 30,
        message: "Starting transcription...",
      });

      // Call our API route
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Transcription API error:", errorData);

        // Handle specific error cases
        if (response.status === 400 && errorData.error?.includes("API key")) {
          throw new Error(
            "AssemblyAI API key is required. Please set it in Settings."
          );
        } else if (response.status === 401) {
          throw new Error(
            "Invalid AssemblyAI API key. Please check your API key in Settings."
          );
        } else if (response.status === 403) {
          throw new Error(
            "AssemblyAI API key doesn't have required permissions."
          );
        } else {
          throw new Error(
            `Transcription failed: ${errorData.error || response.statusText}`
          );
        }
      }

      this.updateProgress({
        stage: "processing",
        progress: 80,
        message: "Processing transcription results...",
      });

      const result = await response.json();

      this.updateProgress({
        stage: "completed",
        progress: 100,
        message: "Transcription completed successfully",
      });

      // Convert raw data to subtitles
      const segments = this.convertToSubtitles(
        result.rawData.assemblyData,
        result.rawData.videoId,
        result.rawData.language
      );

      return {
        segments,
        language: result.rawData.language,
        duration: result.rawData.metadata.audioDuration,
        confidence: result.rawData.metadata.averageConfidence,
        rawData: result.rawData,
      };
    } catch (error) {
      console.error("AssemblyAI transcription error:", error);
      this.updateProgress({
        stage: "error",
        progress: 0,
        message:
          "Transcription failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      });
      throw error;
    }
  }

  private convertToSubtitles(
    transcript: any,
    videoId: string,
    language: string
  ): Subtitle[] {
    const segments: Subtitle[] = [];

    if (transcript.utterances && Array.isArray(transcript.utterances)) {
      // Process utterances with timestamps
      transcript.utterances.forEach((utterance: any, index: number) => {
        if (utterance.text && utterance.text.trim()) {
          const segment: Subtitle = {
            id: `${videoId}_segment_${index}`,
            text: utterance.text.trim(),
            start: utterance.start / 1000, // Convert from milliseconds to seconds
            end: utterance.end / 1000,
            confidence: utterance.confidence || 0.9,
            language,
            videoId,
          };
          segments.push(segment);
        }
      });
    } else if (transcript.words && Array.isArray(transcript.words)) {
      // Process individual words and group them into segments
      let currentSegment: Subtitle | null = null;
      let wordCount = 0;
      const maxWordsPerSegment = 15;

      transcript.words.forEach((word: any, index: number) => {
        if (!currentSegment) {
          currentSegment = {
            id: `${videoId}_segment_${segments.length}`,
            text: word.text,
            start: word.start / 1000,
            end: word.end / 1000,
            confidence: word.confidence || 0.9,
            language,
            videoId,
          };
          wordCount = 1;
        } else {
          currentSegment.text += " " + word.text;
          currentSegment.end = word.end / 1000;
          currentSegment.confidence = Math.min(
            currentSegment.confidence,
            word.confidence || 0.9
          );
          wordCount++;
        }

        // Create new segment if we have enough words or reach the end
        if (
          wordCount >= maxWordsPerSegment ||
          index === transcript.words.length - 1
        ) {
          if (currentSegment) {
            segments.push(currentSegment);
            currentSegment = null;
            wordCount = 0;
          }
        }
      });
    } else if (transcript.text) {
      // Fallback: single text result
      const segment: Subtitle = {
        id: `${videoId}_segment_0`,
        text: transcript.text.trim(),
        start: 0,
        end: 30, // Default duration
        confidence: 0.9,
        language,
        videoId,
      };
      segments.push(segment);
    }

    return segments;
  }

  private calculateDuration(segments: Subtitle[]): number {
    if (segments.length === 0) return 0;
    return Math.max(...segments.map((s) => s.end));
  }

  private calculateAverageConfidence(segments: Subtitle[]): number {
    if (segments.length === 0) return 0;
    const total = segments.reduce(
      (sum, segment) => sum + segment.confidence,
      0
    );
    return total / segments.length;
  }

  private mapLanguageCode(language: string): string {
    const languageMap: { [key: string]: string } = {
      en: "en",
      zh: "zh",
      es: "es",
      fr: "fr",
      de: "de",
      it: "it",
      pt: "pt",
      ru: "ru",
      ja: "ja",
      ko: "ko",
    };

    return languageMap[language.toLowerCase()] || "en";
  }

  private updateProgress(progress: ProcessingProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  async cleanup(): Promise<void> {
    this.isInitialized = false;
  }

  isSupported(): boolean {
    return true; // Always supported when using server-side API
  }

  getAvailableModels(): string[] {
    return ["assemblyai-universal", "assemblyai-best"];
  }

  getModelSize(): string {
    return "Cloud API";
  }

  // Method to check API key validity
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: new FormData(), // Empty form data for testing
      });
      return response.status !== 500; // If not 500, API is working
    } catch (error) {
      console.error("AssemblyAI connection test failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const assemblyAIService = new AssemblyAIService();
