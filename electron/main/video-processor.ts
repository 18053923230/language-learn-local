import { FFmpegService } from "./ffmpeg-service";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

export interface VideoSegment {
  subtitle: any;
  videoFile: any;
  startTime: number;
  endTime: number;
}

export interface ProcessingOptions {
  outputFormat?: "mp4" | "webm" | "avi";
  quality?: "low" | "medium" | "high";
  includeTransitions?: boolean;
  transitionDuration?: number;
  addSubtitles?: boolean;
  subtitleStyle?: "burned" | "overlay";
  outputResolution?: "720p" | "1080p" | "480p";
  useHardwareAcceleration?: boolean;
}

export interface ProcessingProgress {
  stage: "preparing" | "processing" | "combining" | "finalizing" | "completed";
  progress: number;
  message: string;
  currentSegment?: number;
  totalSegments?: number;
}

export class VideoProcessor {
  private ffmpegService: FFmpegService;

  constructor(ffmpegService: FFmpegService) {
    this.ffmpegService = ffmpegService;
  }

  async processVideoSegments(
    segments: VideoSegment[],
    options: ProcessingOptions = {},
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<Buffer> {
    const {
      outputFormat = "mp4",
      quality = "medium",
      includeTransitions = true,
      transitionDuration = 0.5,
      addSubtitles = true,
      subtitleStyle = "overlay",
      outputResolution = "720p",
      useHardwareAcceleration = false,
    } = options;

    try {
      onProgress?.({
        stage: "preparing",
        progress: 10,
        message: "Preparing video segments...",
        totalSegments: segments.length,
      });

      // 处理视频片段
      const segmentFiles = await this.processMultipleVideoSegments(
        segments,
        {
          quality,
          useHardwareAcceleration,
        },
        (current, total) => {
          onProgress?.({
            stage: "processing",
            progress: 10 + (current / total) * 40,
            message: `Processing segment ${current} of ${total}...`,
            currentSegment: current,
            totalSegments: total,
          });
        }
      );

      onProgress?.({
        stage: "combining",
        progress: 50,
        message: "Combining video segments...",
      });

      // 合并视频片段
      const outputPath = path.join(
        os.tmpdir(),
        `output_${Date.now()}.${outputFormat}`
      );
      await this.ffmpegService.combineVideos(segmentFiles, outputPath, {
        quality,
        useHardwareAcceleration,
        addTransitions: includeTransitions,
        transitionDuration,
      });

      onProgress?.({
        stage: "finalizing",
        progress: 90,
        message: "Finalizing video...",
      });

      // 读取输出文件
      const videoBuffer = fs.readFileSync(outputPath);

      // 清理临时文件
      await this.cleanupSegmentFiles(segmentFiles);
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }

      onProgress?.({
        stage: "completed",
        progress: 100,
        message: "Video generation completed!",
      });

      return videoBuffer;
    } catch (error) {
      console.error("Video processing failed:", error);
      throw error;
    }
  }

  private async processMultipleVideoSegments(
    videoSegments: VideoSegment[],
    options: { quality: string; useHardwareAcceleration: boolean },
    onProgress?: (current: number, total: number) => void
  ): Promise<string[]> {
    const segmentFiles: string[] = [];
    const batchSize = Math.min(os.cpus().length, 4); // 复用现有的批处理逻辑

    for (let i = 0; i < videoSegments.length; i += batchSize) {
      const batch = videoSegments.slice(i, i + batchSize);
      const batchPromises = batch.map((segment, batchIndex) =>
        this.processSegment(segment, options, i + batchIndex)
      );

      const batchResults = await Promise.all(batchPromises);
      segmentFiles.push(...batchResults);

      onProgress?.(
        Math.min(i + batchSize, videoSegments.length),
        videoSegments.length
      );
    }

    return segmentFiles;
  }

  private async processSegment(
    segment: VideoSegment,
    options: { quality: string; useHardwareAcceleration: boolean },
    globalIndex: number
  ): Promise<string> {
    const segmentFileName = path.join(
      os.tmpdir(),
      `segment_${globalIndex}_${Date.now()}.mp4`
    );

    await this.ffmpegService.extractVideoSegment(
      segment.videoFile.path,
      segmentFileName,
      segment.startTime,
      segment.endTime - segment.startTime,
      {
        quality: options.quality as "low" | "medium" | "high",
        useHardwareAcceleration: options.useHardwareAcceleration,
        preset: "ultrafast",
        crf: 23,
        audioBitrate: "128k",
      }
    );

    return segmentFileName;
  }

  private async cleanupSegmentFiles(segmentFiles: string[]): Promise<void> {
    for (const file of segmentFiles) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (error) {
        console.error(`Failed to cleanup segment file ${file}:`, error);
      }
    }
  }
}
