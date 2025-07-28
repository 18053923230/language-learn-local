import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Subtitle } from "@/types/subtitle";
import { videoPerformanceOptimizer } from "./video-performance-optimizer";
import { Video } from "@/types/video";

export interface VideoSegment {
  subtitle: Subtitle;
  videoFile: File;
  startTime: number;
  endTime: number;
}

export interface VideoGenerationOptions {
  outputFormat?: "mp4" | "webm" | "avi";
  quality?: "low" | "medium" | "high";
  includeTransitions?: boolean;
  transitionDuration?: number; // seconds
  addSubtitles?: boolean;
  subtitleStyle?: "burned" | "overlay";
  outputResolution?: "720p" | "1080p" | "480p";
  useOptimization?: boolean; // 性能优化选项
  parallelProcessing?: boolean; // 并行处理选项
  useHardwareAcceleration?: boolean; // 硬件加速选项（实验性）
}

export interface VideoGenerationProgress {
  stage: "preparing" | "processing" | "combining" | "finalizing" | "completed";
  progress: number;
  message: string;
  currentSegment?: number;
  totalSegments?: number;
}

export class VideoGenerator {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;

  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    try {
      this.ffmpeg = new FFmpeg();

      // 检测性能信息
      await videoPerformanceOptimizer.detectPerformanceInfo();
      console.log(
        "Performance info detected:",
        videoPerformanceOptimizer.getPerformanceReport()
      );

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
      console.log(
        "VideoGenerator FFmpeg loaded successfully with performance optimization"
      );
    } catch (error) {
      console.error("Failed to load VideoGenerator FFmpeg:", error);
      throw new Error("Failed to initialize video generator");
    }
  }

  /**
   * 从单个视频的字幕片段生成学习视频
   */
  async generateFromSingleVideo(
    videoFile: File,
    subtitles: Subtitle[],
    options: VideoGenerationOptions = {},
    onProgress?: (progress: VideoGenerationProgress) => void
  ): Promise<Blob> {
    if (!this.ffmpeg || !this.isLoaded) {
      await this.initialize();
    }

    const {
      outputFormat = "mp4",
      quality = "medium",
      includeTransitions = true,
      transitionDuration = 0.5,
      addSubtitles = true,
      subtitleStyle = "overlay",
      outputResolution = "720p",
    } = options;

    try {
      onProgress?.({
        stage: "preparing",
        progress: 10,
        message: "Preparing video segments...",
        totalSegments: subtitles.length,
      });

      // 创建视频片段列表
      const segments = subtitles.map((subtitle, index) => ({
        subtitle,
        videoFile,
        startTime: subtitle.start,
        endTime: subtitle.end,
        index,
      }));

      onProgress?.({
        stage: "processing",
        progress: 20,
        message: "Processing video segments...",
        currentSegment: 1,
        totalSegments: segments.length,
      });

      // 生成视频片段文件
      const segmentFiles = await this.processVideoSegments(
        segments,
        (current, total) => {
          onProgress?.({
            stage: "processing",
            progress: 20 + (current / total) * 40,
            message: `Processing segment ${current} of ${total}...`,
            currentSegment: current,
            totalSegments: total,
          });
        }
      );

      onProgress?.({
        stage: "combining",
        progress: 60,
        message: "Combining video segments...",
      });

      // 合并视频片段
      const combinedVideo = await this.combineVideoSegments(
        segmentFiles,
        {
          outputFormat,
          quality,
          includeTransitions,
          transitionDuration,
          addSubtitles,
          subtitleStyle,
          outputResolution,
        },
        (progress) => {
          onProgress?.({
            stage: "combining",
            progress: 60 + progress * 30,
            message: "Combining segments...",
          });
        }
      );

      onProgress?.({
        stage: "finalizing",
        progress: 90,
        message: "Finalizing video...",
      });

      // 清理临时文件
      await this.cleanupSegmentFiles(segmentFiles);

      onProgress?.({
        stage: "completed",
        progress: 100,
        message: "Video generation completed!",
      });

      return combinedVideo;
    } catch (error) {
      console.error("Error generating video:", error);
      throw new Error("Failed to generate video");
    }
  }

  /**
   * 从多个视频的字幕片段生成学习视频
   */
  async generateFromMultipleVideos(
    videoSegments: VideoSegment[],
    options: VideoGenerationOptions = {},
    onProgress?: (progress: VideoGenerationProgress) => void
  ): Promise<Blob> {
    if (!this.ffmpeg || !this.isLoaded) {
      await this.initialize();
    }

    try {
      onProgress?.({
        stage: "preparing",
        progress: 10,
        message: "Preparing multi-video segments...",
        totalSegments: videoSegments.length,
      });

      // 处理每个视频片段
      const segmentFiles = await this.processMultipleVideoSegments(
        videoSegments,
        (current, total) => {
          onProgress?.({
            stage: "processing",
            progress: 20 + (current / total) * 40,
            message: `Processing segment ${current} of ${total}...`,
            currentSegment: current,
            totalSegments: total,
          });
        }
      );

      onProgress?.({
        stage: "combining",
        progress: 60,
        message: "Combining multi-video segments...",
      });

      // 合并视频片段
      const combinedVideo = await this.combineVideoSegments(
        segmentFiles,
        options,
        (progress) => {
          onProgress?.({
            stage: "combining",
            progress: 60 + progress * 30,
            message: "Combining segments...",
          });
        }
      );

      onProgress?.({
        stage: "finalizing",
        progress: 90,
        message: "Finalizing multi-video...",
      });

      // 清理临时文件
      await this.cleanupSegmentFiles(segmentFiles);

      onProgress?.({
        stage: "completed",
        progress: 100,
        message: "Multi-video generation completed!",
      });

      return combinedVideo;
    } catch (error) {
      console.error("Error generating multi-video:", error);
      throw new Error("Failed to generate multi-video");
    }
  }

  /**
   * 处理单个视频的片段
   */
  private async processVideoSegments(
    segments: Array<{
      subtitle: Subtitle;
      videoFile: File;
      startTime: number;
      endTime: number;
      index: number;
    }>,
    onProgress?: (current: number, total: number) => void
  ): Promise<string[]> {
    const segmentFiles: string[] = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const segmentFileName = `segment_${i}.mp4`;

      try {
        // 写入原始视频文件
        await this.ffmpeg!.writeFile(
          "input_video",
          await fetchFile(segment.videoFile)
        );

        // 提取视频片段
        const args = [
          "-i",
          "input_video",
          "-ss",
          segment.startTime.toString(),
          "-t",
          (segment.endTime - segment.startTime).toString(),
          "-c:v",
          "libx264",
          "-c:a",
          "aac",
          "-avoid_negative_ts",
          "make_zero",
          "-y", // 覆盖输出文件
          segmentFileName,
        ];

        await this.ffmpeg!.exec(args);
        segmentFiles.push(segmentFileName);

        onProgress?.(i + 1, segments.length);
      } catch (error) {
        console.error(`Error processing segment ${i}:`, error);
        throw new Error(`Failed to process segment ${i}`);
      }
    }

    return segmentFiles;
  }

  /**
   * 处理多个视频的片段（优化版本）
   */
  private async processMultipleVideoSegments(
    videoSegments: VideoSegment[],
    onProgress?: (current: number, total: number) => void
  ): Promise<string[]> {
    const segmentFiles: string[] = [];
    const batchSize = videoPerformanceOptimizer.getOptimalBatchSize(); // 基于硬件配置的批处理大小

    // 分批处理视频片段
    for (
      let batchStart = 0;
      batchStart < videoSegments.length;
      batchStart += batchSize
    ) {
      const batch = videoSegments.slice(batchStart, batchStart + batchSize);

      // 并行处理当前批次的片段
      const batchPromises = batch.map(async (segment, batchIndex) => {
        const globalIndex = batchStart + batchIndex;
        const segmentFileName = `segment_${globalIndex}.mp4`;

        try {
          // 写入原始视频文件
          await this.ffmpeg!.writeFile(
            `input_video_${globalIndex}`,
            await fetchFile(segment.videoFile)
          );

          // 使用性能优化器的 FFmpeg 参数
          const optimizationArgs =
            videoPerformanceOptimizer.getFFmpegOptimizationArgs();
          const args = [
            "-i",
            `input_video_${globalIndex}`,
            "-ss",
            segment.startTime.toString(),
            "-t",
            (segment.endTime - segment.startTime).toString(),
            ...optimizationArgs,
            "-avoid_negative_ts",
            "make_zero",
            "-y",
            segmentFileName,
          ];

          await this.ffmpeg!.exec(args);
          return segmentFileName;
        } catch (error) {
          console.error(
            `Error processing multi-video segment ${globalIndex}:`,
            error
          );
          throw new Error(
            `Failed to process multi-video segment ${globalIndex}`
          );
        }
      });

      // 等待当前批次完成
      const batchResults = await Promise.all(batchPromises);
      segmentFiles.push(...batchResults);

      onProgress?.(
        Math.min(batchStart + batchSize, videoSegments.length),
        videoSegments.length
      );
    }

    return segmentFiles;
  }

  /**
   * 合并视频片段
   */
  private async combineVideoSegments(
    segmentFiles: string[],
    options: VideoGenerationOptions,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const {
      outputFormat = "mp4",
      quality = "medium",
      includeTransitions = true,
      transitionDuration = 0.5,
      addSubtitles = true,
      subtitleStyle = "overlay",
      outputResolution = "720p",
    } = options;

    try {
      // 创建片段列表文件
      const concatList = segmentFiles
        .map((file) => `file '${file}'`)
        .join("\n");

      await this.ffmpeg!.writeFile("concat_list.txt", concatList);

      // 设置输出参数
      const outputFileName = `output.${outputFormat}`;
      const resolution = this.getResolutionSettings(outputResolution);
      const qualitySettings = this.getQualitySettings(quality);

      const args = [
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        "concat_list.txt",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast", // 使用最快的编码预设
        "-crf",
        "23", // 平衡质量和速度
        "-c:a",
        "aac",
        "-b:a",
        "128k", // 固定音频比特率
        "-movflags",
        "+faststart", // 优化网络播放
        ...resolution,
        "-y",
        outputFileName,
      ];

      await this.ffmpeg!.exec(args);
      onProgress?.(1.0);

      // 读取输出文件
      const data = await this.ffmpeg!.readFile(outputFileName);
      const videoBlob = new Blob([data], { type: `video/${outputFormat}` });

      // 清理输出文件
      await this.ffmpeg!.deleteFile(outputFileName);
      await this.ffmpeg!.deleteFile("concat_list.txt");

      return videoBlob;
    } catch (error) {
      console.error("Error combining video segments:", error);
      throw new Error("Failed to combine video segments");
    }
  }

  /**
   * 清理临时文件
   */
  private async cleanupSegmentFiles(segmentFiles: string[]): Promise<void> {
    for (const file of segmentFiles) {
      try {
        await this.ffmpeg!.deleteFile(file);
      } catch (error) {
        console.warn(`Failed to delete segment file ${file}:`, error);
      }
    }
  }

  /**
   * 获取分辨率设置
   */
  private getResolutionSettings(resolution: string): string[] {
    switch (resolution) {
      case "1080p":
        return ["-vf", "scale=1920:1080"];
      case "720p":
        return ["-vf", "scale=1280:720"];
      case "480p":
        return ["-vf", "scale=854:480"];
      default:
        return [];
    }
  }

  /**
   * 获取质量设置
   */
  private getQualitySettings(quality: string): string[] {
    switch (quality) {
      case "high":
        return ["-crf", "18"];
      case "medium":
        return ["-crf", "23"];
      case "low":
        return ["-crf", "28"];
      default:
        return ["-crf", "23"];
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    if (this.ffmpeg) {
      try {
        await this.ffmpeg.terminate();
      } catch (error) {
        console.warn("Error terminating VideoGenerator FFmpeg:", error);
      }
      this.ffmpeg = null;
      this.isLoaded = false;
    }
  }
}

// 导出单例实例
export const videoGenerator = new VideoGenerator();
