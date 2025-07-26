import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export interface AudioProcessingOptions {
  format?: "wav" | "mp3" | "flac";
  sampleRate?: number;
  channels?: number;
  quality?: number;
}

export interface AudioProcessingResult {
  audioBlob: Blob;
  duration: number;
  sampleRate: number;
  channels: number;
  format: string;
}

export class AudioProcessor {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;

  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    try {
      this.ffmpeg = new FFmpeg();

      // Load FFmpeg
      await this.ffmpeg.load({
        coreURL: await toBlobURL(
          "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm",
          "application/wasm"
        ),
      });

      this.isLoaded = true;
      console.log("FFmpeg loaded successfully");
    } catch (error) {
      console.error("Failed to load FFmpeg:", error);
      throw new Error("Failed to initialize audio processor");
    }
  }

  async extractAudioFromVideo(
    videoFile: File,
    options: AudioProcessingOptions = {}
  ): Promise<AudioProcessingResult> {
    if (!this.ffmpeg || !this.isLoaded) {
      await this.initialize();
    }

    const {
      format = "wav",
      sampleRate = 16000,
      channels = 1,
      quality = 5,
    } = options;

    try {
      // Write video file to FFmpeg
      const inputFileName = "input_video";
      const outputFileName = `output_audio.${format}`;

      await this.ffmpeg!.writeFile(inputFileName, await fetchFile(videoFile));

      // Extract audio with specified parameters
      const args = [
        "-i",
        inputFileName,
        "-vn", // No video
        "-ar",
        sampleRate.toString(), // Sample rate
        "-ac",
        channels.toString(), // Channels
        "-f",
        format, // Format
      ];

      // Add quality settings for different formats
      if (format === "mp3") {
        args.push("-q:a", quality.toString());
      } else if (format === "flac") {
        args.push("-compression_level", quality.toString());
      }

      args.push(outputFileName);

      await this.ffmpeg!.exec(args);

      // Read the output file
      const data = await this.ffmpeg!.readFile(outputFileName);
      const audioBlob = new Blob([data], { type: `audio/${format}` });

      // Get audio duration (approximate)
      const duration = await this.getAudioDuration(audioBlob);

      // Clean up files
      await this.ffmpeg!.deleteFile(inputFileName);
      await this.ffmpeg!.deleteFile(outputFileName);

      return {
        audioBlob,
        duration,
        sampleRate,
        channels,
        format,
      };
    } catch (error) {
      console.error("Error extracting audio:", error);
      throw new Error("Failed to extract audio from video");
    }
  }

  async convertAudioFormat(
    audioBlob: Blob,
    targetFormat: "wav" | "mp3" | "flac",
    options: AudioProcessingOptions = {}
  ): Promise<AudioProcessingResult> {
    if (!this.ffmpeg || !this.isLoaded) {
      await this.initialize();
    }

    const { sampleRate = 16000, channels = 1, quality = 5 } = options;

    try {
      const inputFileName = "input_audio";
      const outputFileName = `output_audio.${targetFormat}`;

      await this.ffmpeg!.writeFile(inputFileName, await fetchFile(audioBlob));

      const args = [
        "-i",
        inputFileName,
        "-ar",
        sampleRate.toString(),
        "-ac",
        channels.toString(),
        "-f",
        targetFormat,
      ];

      if (targetFormat === "mp3") {
        args.push("-q:a", quality.toString());
      } else if (targetFormat === "flac") {
        args.push("-compression_level", quality.toString());
      }

      args.push(outputFileName);

      await this.ffmpeg!.exec(args);

      const data = await this.ffmpeg!.readFile(outputFileName);
      const resultBlob = new Blob([data], { type: `audio/${targetFormat}` });

      const duration = await this.getAudioDuration(resultBlob);

      // Clean up files
      await this.ffmpeg!.deleteFile(inputFileName);
      await this.ffmpeg!.deleteFile(outputFileName);

      return {
        audioBlob: resultBlob,
        duration,
        sampleRate,
        channels,
        format: targetFormat,
      };
    } catch (error) {
      console.error("Error converting audio format:", error);
      throw new Error("Failed to convert audio format");
    }
  }

  private async getAudioDuration(audioBlob: Blob): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(audioBlob);

      audio.addEventListener("loadedmetadata", () => {
        const duration = audio.duration;
        URL.revokeObjectURL(audio.src);
        resolve(duration);
      });

      audio.addEventListener("error", () => {
        URL.revokeObjectURL(audio.src);
        resolve(0); // Fallback duration
      });
    });
  }

  async cleanup(): Promise<void> {
    if (this.ffmpeg) {
      try {
        await this.ffmpeg.terminate();
      } catch (error) {
        console.warn("Error terminating FFmpeg:", error);
      }
      this.ffmpeg = null;
      this.isLoaded = false;
    }
  }
}

// Singleton instance
export const audioProcessor = new AudioProcessor();
