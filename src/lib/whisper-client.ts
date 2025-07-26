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

      // Simulate model loading with realistic timing
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.updateProgress({
          stage: "loading",
          progress: i,
          message: `Loading model... ${i}%`,
        });
      }

      this.isLoaded = true;
      this.updateProgress({
        stage: "loading",
        progress: 100,
        message: "Whisper model loaded successfully",
      });

      console.log("Whisper loaded successfully (simulation mode)");
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

      // Simulate audio processing
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.updateProgress({
        stage: "processing",
        progress: 20,
        message: "Processing audio...",
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.updateProgress({
        stage: "processing",
        progress: 40,
        message: "Analyzing speech patterns...",
      });

      // Generate realistic mock segments based on language
      const segments: Subtitle[] = this.generateMockSegments(videoId, language);

      // Simulate real-time transcription
      for (let i = 0; i < segments.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        this.updateProgress({
          stage: "processing",
          progress: 40 + (i / segments.length) * 50,
          message: `Transcribing... ${i + 1}/${segments.length} segments`,
          currentSegment: i + 1,
          totalSegments: segments.length,
        });
      }

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

  private generateMockSegments(videoId: string, language: string): Subtitle[] {
    const mockData = {
      en: [
        "Hello, welcome to our language learning application.",
        "This is a demonstration of speech recognition technology.",
        "The system is designed to help you learn languages effectively.",
        "You can upload videos and get accurate transcriptions.",
        "Let's continue with the learning process.",
      ],
      zh: [
        "你好，欢迎使用我们的语言学习应用。",
        "这是语音识别技术的演示。",
        "该系统旨在帮助您有效地学习语言。",
        "您可以上传视频并获得准确的转录。",
        "让我们继续学习过程。",
      ],
      ja: [
        "こんにちは、言語学習アプリケーションへようこそ。",
        "これは音声認識技術のデモンストレーションです。",
        "このシステムは、効果的に言語を学ぶのに役立ちます。",
        "動画をアップロードして、正確な文字起こしを取得できます。",
        "学習プロセスを続けましょう。",
      ],
      ko: [
        "안녕하세요, 언어 학습 애플리케이션에 오신 것을 환영합니다.",
        "이것은 음성 인식 기술의 데모입니다.",
        "이 시스템은 효과적으로 언어를 배우는 데 도움이 됩니다.",
        "비디오를 업로드하고 정확한 전사를 받을 수 있습니다.",
        "학습 과정을 계속해 보겠습니다.",
      ],
    };

    const texts = mockData[language as keyof typeof mockData] || mockData.en;
    const segments: Subtitle[] = [];

    texts.forEach((text, index) => {
      segments.push({
        id: `${videoId}_segment_${index}`,
        text,
        start: index * 3,
        end: (index + 1) * 3,
        confidence: 0.85 + Math.random() * 0.1, // 0.85-0.95
        language,
        videoId,
      });
    });

    return segments;
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
