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
   * 处理单个视频的片段（优化版本 - 分批处理）
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
    const batchSize = 1; // 每次只处理1个片段，彻底避免内存溢出

    // 分批处理片段
    for (
      let batchStart = 0;
      batchStart < segments.length;
      batchStart += batchSize
    ) {
      const batch = segments.slice(batchStart, batchStart + batchSize);

      console.log(
        `Processing batch ${Math.floor(batchStart / batchSize) + 1}/${Math.ceil(
          segments.length / batchSize
        )}`
      );

      // 处理当前批次的片段
      for (let i = 0; i < batch.length; i++) {
        const segment = batch[i];
        const globalIndex = batchStart + i;
        const segmentFileName = `segment_${globalIndex}.mp4`;

        try {
          // 清理之前的临时文件
          await this.cleanupTempFiles();

          // 写入原始视频文件
          await this.ffmpeg!.writeFile(
            "input_video",
            await fetchFile(segment.videoFile)
          );

          // 优先使用快速复制模式，如果支持的话
          const canUseCopy = this.canUseCopyMode(segment.videoFile);
          let optimizationArgs = canUseCopy
            ? this.getFastCopyArgs()
            : this.getMemoryOptimizedArgs();

          console.log(
            `Processing segment ${globalIndex + 1}: ${
              canUseCopy ? "FAST COPY MODE" : "ENCODE MODE"
            }`
          );

          let args = [
            "-i",
            "input_video",
            "-ss",
            segment.startTime.toString(),
            "-t",
            (segment.endTime - segment.startTime).toString(),
            ...optimizationArgs,
            "-y",
            segmentFileName,
          ];

          try {
            await this.ffmpeg!.exec(args);
          } catch (copyError) {
            console.warn(
              `Copy mode failed for segment ${
                globalIndex + 1
              }, trying safe mode:`,
              copyError
            );

            // 如果copy模式失败，尝试安全的编码模式
            optimizationArgs = this.getSafeCopyArgs();
            args = [
              "-i",
              "input_video",
              "-ss",
              segment.startTime.toString(),
              "-t",
              (segment.endTime - segment.startTime).toString(),
              ...optimizationArgs,
              "-y",
              segmentFileName,
            ];

            console.log(
              `Retrying segment ${globalIndex + 1} with SAFE ENCODE MODE`
            );
            await this.ffmpeg!.exec(args);
          }
          segmentFiles.push(segmentFileName);

          // 立即清理输入文件以释放内存
          await this.ffmpeg!.deleteFile("input_video");

          // 深度清理内存
          await this.deepMemoryCleanup();

          onProgress?.(globalIndex + 1, segments.length);

          // 每处理1个片段后暂停一下，让浏览器回收内存
          if ((globalIndex + 1) % 1 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            // 额外的内存清理
            await this.deepMemoryCleanup();
          }
        } catch (error) {
          console.error(`Error processing segment ${globalIndex}:`, error);

          // 尝试清理临时文件
          await this.cleanupTempFiles();

          // 如果是内存错误，尝试减少批处理大小
          if (error instanceof Error && error.message.includes("memory")) {
            console.warn("Memory error detected, reducing batch size");
            // 这里可以实现动态调整批处理大小的逻辑
          }

          throw new Error(`Failed to process segment ${globalIndex}`);
        }
      }

      // 每批处理完成后暂停，让浏览器回收内存
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // 批次完成后的深度内存清理
      await this.deepMemoryCleanup();
      console.log(
        `Batch ${
          Math.floor(batchStart / batchSize) + 1
        } completed, deep memory cleaned`
      );
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
      // 检查片段文件是否存在
      console.log("Checking segment files:", segmentFiles);
      for (const file of segmentFiles) {
        try {
          await this.ffmpeg!.readFile(file);
          console.log(`Segment file ${file} exists`);
        } catch (error) {
          console.error(`Segment file ${file} not found:`, error);
          throw new Error(`Segment file ${file} not found`);
        }
      }

      // 创建片段列表文件，添加黑屏转场
      const concatList = segmentFiles
        .map((file, index) => {
          let result = `file '${file}'`;

          // 在片段之间添加黑屏转场
          if (index < segmentFiles.length - 1) {
            const transitionDuration = options.transitionDuration || 0.5;
            if (transitionDuration > 0) {
              result += `\nduration ${transitionDuration}`;
            }
          }

          return result;
        })
        .join("\n");

      console.log("Creating concat list:", concatList);
      await this.ffmpeg!.writeFile("concat_list.txt", concatList);

      // 设置输出参数
      const outputFileName = `output.${outputFormat}`;
      const resolution = this.getResolutionSettings(outputResolution);

      // 使用性能优化器的 FFmpeg 参数（包含质量设置）
      const optimizationArgs =
        videoPerformanceOptimizer.getFFmpegOptimizationArgs();
      const args = [
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        "concat_list.txt",
        "-c:v",
        "libx264",
        ...optimizationArgs,
        ...resolution,
        "-y",
        outputFileName,
      ];

      console.log("Combining video segments with args:", args);
      await this.ffmpeg!.exec(args);
      onProgress?.(1.0);

      // 读取输出文件
      console.log("Reading output file:", outputFileName);
      const data = await this.ffmpeg!.readFile(outputFileName);
      const videoBlob = new Blob([data], { type: `video/${outputFormat}` });

      // 清理输出文件
      await this.ffmpeg!.deleteFile(outputFileName);
      await this.ffmpeg!.deleteFile("concat_list.txt");

      return videoBlob;
    } catch (error) {
      console.error("Error combining video segments:", error);

      // 尝试清理临时文件
      try {
        await this.ffmpeg!.deleteFile("concat_list.txt");
        await this.ffmpeg!.deleteFile(`output.${outputFormat}`);
      } catch (cleanupError) {
        console.warn("Failed to cleanup files:", cleanupError);
      }

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
   * 清理临时文件（内存优化版本）
   */
  private async cleanupTempFiles(): Promise<void> {
    const tempFiles = ["input_video", "concat_list.txt"];
    for (const file of tempFiles) {
      try {
        await this.ffmpeg!.deleteFile(file);
      } catch (error) {
        // 忽略文件不存在的错误
      }
    }
  }

  /**
   * 获取内存优化的 FFmpeg 参数
   */
  private getMemoryOptimizedArgs(): string[] {
    return [
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast", // 使用最快的编码预设
      "-crf",
      "28", // 稍微降低质量以减少内存使用
      "-max_muxing_queue_size",
      "1024", // 限制复用队列大小
      "-threads",
      "1", // 使用单线程减少内存使用
      "-avoid_negative_ts",
      "make_zero",
    ];
  }

  /**
   * 获取快速复制模式的 FFmpeg 参数（推荐）
   */
  private getFastCopyArgs(): string[] {
    return [
      "-c:v",
      "copy", // 复制视频流
      "-c:a",
      "copy", // 复制音频流
      "-avoid_negative_ts",
      "make_zero",
      "-fflags",
      "+genpts", // 生成新的时间戳
      "-map",
      "0:v:0", // 明确映射第一个视频流
      "-map",
      "0:a:0", // 明确映射第一个音频流
    ];
  }

  /**
   * 获取安全的复制模式参数（如果copy失败时的备选方案）
   */
  private getSafeCopyArgs(): string[] {
    return [
      "-c:v",
      "libx264", // 重新编码视频
      "-c:a",
      "copy", // 复制音频
      "-preset",
      "ultrafast",
      "-crf",
      "23", // 保持较好质量
      "-avoid_negative_ts",
      "make_zero",
      "-fflags",
      "+genpts",
    ];
  }

  /**
   * 检查是否可以使用 copy 模式
   */
  private canUseCopyMode(videoFile: File): boolean {
    // 检查视频格式是否支持 copy 模式
    const supportedFormats = ["mp4", "avi", "mov", "mkv", "webm"];
    const fileExtension = videoFile.name.split(".").pop()?.toLowerCase();
    return supportedFormats.includes(fileExtension || "");
  }

  /**
   * 强制内存清理
   */
  private async forceMemoryCleanup(): Promise<void> {
    try {
      // 清理所有可能的临时文件
      const tempFiles = ["input_video", "concat_list.txt", "temp_output"];
      for (const file of tempFiles) {
        try {
          await this.ffmpeg!.deleteFile(file);
        } catch (error) {
          // 忽略文件不存在的错误
        }
      }

      // 强制垃圾回收（如果支持）
      if ("gc" in window) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).gc();
          console.log("Forced garbage collection");
        } catch (error) {
          console.warn("Failed to force garbage collection:", error);
        }
      }

      // 短暂暂停让浏览器回收内存
      await new Promise((resolve) => setTimeout(resolve, 50));
    } catch (error) {
      console.warn("Error during memory cleanup:", error);
    }
  }

  /**
   * 深度内存清理 - 一键清内存
   */
  private async deepMemoryCleanup(): Promise<void> {
    console.log("🚀 Starting deep memory cleanup...");

    try {
      // 1. 清理所有可能的临时文件
      const allTempFiles = [
        "input_video",
        "concat_list.txt",
        "temp_output",
        "output_video",
        "segment_",
        "temp_",
        "input_",
      ];

      for (const file of allTempFiles) {
        try {
          await this.ffmpeg!.deleteFile(file);
        } catch (error) {
          // 忽略文件不存在的错误
        }
      }

      // 2. 多次强制垃圾回收
      if ("gc" in window) {
        for (let i = 0; i < 3; i++) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).gc();
            console.log(`Deep garbage collection ${i + 1}/3`);
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            console.warn("Failed to force garbage collection:", error);
          }
        }
      }

      // 3. 长时间暂停让浏览器充分回收内存
      console.log("⏳ Waiting for memory cleanup...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 4. 清理 URL 对象
      try {
        // 清理可能存在的 URL 对象
        if (typeof URL !== "undefined") {
          // 这里我们无法直接清理所有 URL，但可以提醒用户
          console.log("💡 Consider refreshing page to clear all URL objects");
        }
      } catch (error) {
        console.warn("Error cleaning URL objects:", error);
      }

      console.log("✅ Deep memory cleanup completed");
    } catch (error) {
      console.error("❌ Error during deep memory cleanup:", error);
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
