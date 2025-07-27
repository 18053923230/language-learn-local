import { AssemblyAI } from "assemblyai";
import { Subtitle } from "@/types/subtitle";

export interface AssemblyAIResult {
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

export class AssemblyAIService {
  private client: AssemblyAI | null = null;
  private isInitialized = false;
  private progressCallback?: (progress: ProcessingProgress) => void;

  constructor() {
    // Initialize with API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY;

    if (apiKey) {
      this.client = new AssemblyAI({
        apiKey: apiKey,
      });
    }
  }

  async initialize(language: string = "en"): Promise<void> {
    if (this.isInitialized) return;

    this.updateProgress({
      stage: "loading",
      progress: 0,
      message: "Initializing AssemblyAI service...",
    });

    try {
      if (!this.client) {
        throw new Error(
          "AssemblyAI client not initialized. Please check API key."
        );
      }

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

    if (!this.client) {
      throw new Error("AssemblyAI client not available");
    }

    this.progressCallback = onProgress;

    this.updateProgress({
      stage: "processing",
      progress: 10,
      message: "Uploading audio to AssemblyAI...",
    });

    try {
      // Convert blob to base64 for upload
      const base64Audio = await this.blobToBase64(audioBlob);

      this.updateProgress({
        stage: "processing",
        progress: 20,
        message: "Starting transcription with AssemblyAI...",
      });

      // Configure transcription parameters
      const params = {
        audio: base64Audio,
        speech_model: "universal" as const, // Use universal model for better accuracy
        language_code: this.mapLanguageCode(language),
        punctuate: true,
        format_text: true,
        speaker_labels: false, // Disable for simpler output
        auto_highlights: false,
        content_safety: false,
        iab_categories: false,
        auto_chapters: false,
        entity_detection: false,
        sentiment_analysis: false,
        disfluencies: false,
        profanity_filter: false,
        boost_param: "low" as const, // Optimize for speed
      };

      console.log("Starting AssemblyAI transcription with params:", params);

      // Start transcription
      const transcript = await this.client.transcripts.transcribe(params);

      console.log("AssemblyAI transcription result:", transcript);

      this.updateProgress({
        stage: "processing",
        progress: 80,
        message: "Processing transcription results...",
      });

      // Convert AssemblyAI result to our subtitle format
      const segments = this.convertToSubtitles(transcript, videoId, language);

      this.updateProgress({
        stage: "completed",
        progress: 100,
        message: "Transcription completed successfully",
      });

      return {
        segments,
        language,
        duration: this.calculateDuration(segments),
        confidence: this.calculateAverageConfidence(segments),
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

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 string
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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
    // No cleanup needed for API service
    this.isInitialized = false;
  }

  isSupported(): boolean {
    return this.client !== null;
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
      if (!this.client) return false;

      // Try a simple API call to test connection
      const response = await this.client.transcripts.list({ limit: 1 });
      return true;
    } catch (error) {
      console.error("AssemblyAI connection test failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const assemblyAIService = new AssemblyAIService();
