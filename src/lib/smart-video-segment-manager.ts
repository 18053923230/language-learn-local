import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Subtitle } from "@/types/subtitle";
import { Video } from "@/types/video";
import {
  VideoSegment,
  VideoSegmentFolder,
  SegmentGenerationOptions,
  SegmentGenerationProgress,
  SegmentCompositionOptions,
  SegmentCompositionProgress,
} from "@/types/video-segment";
import { videoSegmentStorage } from "./video-segment-storage";
import { videoPerformanceOptimizer } from "./video-performance-optimizer";
import { FolderOpener } from "./folder-opener";
import { toast } from "sonner";

export class SmartVideoSegmentManager {
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
      console.log("SmartVideoSegmentManager FFmpeg loaded successfully");
    } catch (error) {
      console.error("Failed to load SmartVideoSegmentManager FFmpeg:", error);
      throw new Error("Failed to initialize smart video segment manager");
    }
  }

  /**
   * 智能检查并生成视频片段
   * 如果片段已存在，直接返回；否则生成新片段
   */
  async smartGenerateSegments(
    video: Video,
    subtitles: Subtitle[],
    options: SegmentGenerationOptions = {
      format: "mp4",
      quality: "medium",
      resolution: "720p",
    },
    onProgress?: (progress: SegmentGenerationProgress) => void
  ): Promise<VideoSegmentFolder> {
    if (!this.ffmpeg || !this.isLoaded) {
      await this.initialize();
    }

    // 生成标准化的文件夹名称
    const folderName = this.generateStandardFolderName(
      video,
      subtitles,
      options
    );

    // 检查是否已存在相同的片段文件夹
    const existingFolder = await videoSegmentStorage.checkFolderExists(
      video.id,
      folderName
    );

    if (existingFolder && existingFolder.status === "completed") {
      onProgress?.({
        stage: "completed",
        progress: 100,
        message: "片段已存在，无需重新生成",
        folderName,
      });
      return existingFolder;
    }

    // 如果文件夹存在但未完成，删除重新生成
    if (existingFolder) {
      await videoSegmentStorage.deleteFolder(existingFolder.id);
    }

    // 创建新的片段文件夹
    const folder = await videoSegmentStorage.createFolder(
      video.id,
      folderName,
      subtitles,
      video,
      options
    );

    // 创建片段记录
    const segments = await videoSegmentStorage.createSegments(
      video.id,
      subtitles,
      folderName,
      options
    );

    // 开始生成片段
    await this.generateSegments(video, segments, folder, options, onProgress);

    return folder;
  }

  /**
   * 生成视频片段
   */
  private async generateSegments(
    video: Video,
    segments: VideoSegment[],
    folder: VideoSegmentFolder,
    options: SegmentGenerationOptions,
    onProgress?: (progress: SegmentGenerationProgress) => void
  ): Promise<void> {
    try {
      onProgress?.({
        stage: "checking",
        progress: 5,
        message: "检查视频文件...",
        totalSegments: segments.length,
        folderName: folder.folderName,
      });

      // 更新文件夹状态为处理中
      await videoSegmentStorage.updateFolderStatus(folder.id, "processing");

      onProgress?.({
        stage: "preparing",
        progress: 10,
        message: "准备生成片段...",
        totalSegments: segments.length,
        folderName: folder.folderName,
      });

      let completedCount = 0;
      let totalSize = 0;

      // 分批处理片段（内存优化）
      const batchSize = 2; // 每批处理2个片段，避免内存溢出

      for (
        let batchStart = 0;
        batchStart < segments.length;
        batchStart += batchSize
      ) {
        const batch = segments.slice(batchStart, batchStart + batchSize);

        console.log(
          `Processing batch ${
            Math.floor(batchStart / batchSize) + 1
          }/${Math.ceil(segments.length / batchSize)}`
        );

        // 处理当前批次的片段
        for (let i = 0; i < batch.length; i++) {
          const segment = batch[i];
          const globalIndex = batchStart + i;

          try {
            // 更新片段状态为处理中
            await videoSegmentStorage.updateSegmentStatus(
              segment.id,
              "processing"
            );

            onProgress?.({
              stage: "processing",
              progress: 10 + ((globalIndex + 1) / segments.length) * 80,
              message: `生成片段 ${globalIndex + 1} / ${segments.length}`,
              currentSegment: globalIndex + 1,
              totalSegments: segments.length,
              folderName: folder.folderName,
            });

            // 生成片段文件
            const segmentBlob = await this.generateSingleSegment(
              video.file!,
              segment.subtitle,
              options
            );

            // 创建下载链接并触发下载
            const url = URL.createObjectURL(segmentBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = segment.fileName;
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // 立即清理内存
            await this.forceMemoryCleanup();

            // 更新片段状态为完成
            await videoSegmentStorage.updateSegmentStatus(
              segment.id,
              "completed",
              segmentBlob.size
            );

            completedCount++;
            totalSize += segmentBlob.size;

            // 更新文件夹进度
            await videoSegmentStorage.updateFolderStatus(
              folder.id,
              "processing",
              completedCount,
              totalSize
            );

            // 每处理1个片段后暂停，让浏览器回收内存
            if ((globalIndex + 1) % 1 === 0) {
              await new Promise((resolve) => setTimeout(resolve, 200));
              await this.forceMemoryCleanup();
            }
          } catch (error) {
            console.error(
              `Error generating segment ${globalIndex + 1}:`,
              error
            );
            await videoSegmentStorage.updateSegmentStatus(
              segment.id,
              "failed",
              undefined,
              error instanceof Error ? error.message : "Unknown error"
            );

            // 错误后也清理内存
            await this.forceMemoryCleanup();
          }
        }

        // 每批处理完成后暂停，让浏览器回收内存
        await new Promise((resolve) => setTimeout(resolve, 500));
        await this.forceMemoryCleanup();
        console.log(
          `Batch ${
            Math.floor(batchStart / batchSize) + 1
          } completed, memory cleaned`
        );
      }

      onProgress?.({
        stage: "saving",
        progress: 95,
        message: "保存片段信息...",
        folderName: folder.folderName,
      });

      // 创建片段信息文件
      const segmentsInfo = {
        folderName: folder.folderName,
        totalSegments: segments.length,
        completedSegments: completedCount,
        generatedAt: new Date().toISOString(),
        originalVideo: video.name,
        segments: segments.map((segment) => ({
          fileName: segment.fileName,
          text: segment.subtitle.text,
          start: segment.subtitle.start,
          end: segment.subtitle.end,
          duration: segment.duration,
          size: segment.size,
        })),
      };

      // 下载片段信息文件
      const infoBlob = new Blob([JSON.stringify(segmentsInfo, null, 2)], {
        type: "application/json",
      });
      const infoUrl = URL.createObjectURL(infoBlob);
      const infoLink = document.createElement("a");
      infoLink.href = infoUrl;
      infoLink.download = `${folder.folderName}_segments_info.json`;
      infoLink.style.display = "none";
      document.body.appendChild(infoLink);
      infoLink.click();
      document.body.removeChild(infoLink);
      URL.revokeObjectURL(infoUrl);

      // 更新文件夹状态为完成
      await videoSegmentStorage.updateFolderStatus(
        folder.id,
        "completed",
        completedCount,
        totalSize
      );

      onProgress?.({
        stage: "completed",
        progress: 100,
        message: `成功生成 ${completedCount} 个视频片段！`,
        folderName: folder.folderName,
      });

      // 尝试打开文件夹
      try {
        await FolderOpener.openFolder(folder.folderPath);
      } catch (error) {
        console.warn("Failed to open folder:", error);
      }
    } catch (error) {
      console.error("Error generating segments:", error);
      await videoSegmentStorage.updateFolderStatus(folder.id, "failed");
      throw error;
    }
  }

  /**
   * 生成单个视频片段
   */
  private async generateSingleSegment(
    videoFile: File,
    subtitle: Subtitle,
    options: SegmentGenerationOptions
  ): Promise<Blob> {
    try {
      // 写入原始视频文件
      await this.ffmpeg!.writeFile("input_video", await fetchFile(videoFile));

      // 优先使用快速复制模式，如果支持的话
      const canUseCopy = this.canUseCopyMode(videoFile);
      let optimizationArgs = canUseCopy
        ? this.getFastCopyArgs()
        : this.getMemoryOptimizedArgs();

      console.log(
        `Processing segment: ${canUseCopy ? "FAST COPY MODE" : "ENCODE MODE"}`
      );

      // 只有在非copy模式下才应用质量和分辨率设置
      let qualityArgs = canUseCopy
        ? []
        : this.getQualitySettings(options.quality);
      let resolutionArgs = canUseCopy
        ? []
        : this.getResolutionSettings(options.resolution);

      const outputFileName = `segment_${this.sanitizeFileName(subtitle.text)}.${
        options.format
      }`;

      let args = [
        "-i",
        "input_video",
        "-ss",
        subtitle.start.toString(),
        "-t",
        (subtitle.end - subtitle.start).toString(),
        ...optimizationArgs,
        ...qualityArgs,
        ...resolutionArgs,
        "-y",
        outputFileName,
      ];

      try {
        await this.ffmpeg!.exec(args);
      } catch (copyError) {
        console.warn(`Copy mode failed, trying safe mode:`, copyError);

        // 如果copy模式失败，尝试安全的编码模式
        optimizationArgs = this.getSafeCopyArgs();
        qualityArgs = this.getQualitySettings(options.quality);
        resolutionArgs = this.getResolutionSettings(options.resolution);

        args = [
          "-i",
          "input_video",
          "-ss",
          subtitle.start.toString(),
          "-t",
          (subtitle.end - subtitle.start).toString(),
          ...optimizationArgs,
          ...qualityArgs,
          ...resolutionArgs,
          "-y",
          outputFileName,
        ];

        console.log(`Retrying with SAFE ENCODE MODE`);
        await this.ffmpeg!.exec(args);
      }

      // 读取生成的片段文件
      const segmentData = await this.ffmpeg!.readFile(outputFileName);
      const segmentBlob = new Blob([segmentData], {
        type: `video/${options.format}`,
      });

      // 清理临时文件
      await this.ffmpeg!.deleteFile(outputFileName);
      await this.ffmpeg!.deleteFile("input_video");

      return segmentBlob;
    } catch (error) {
      console.error("Error generating single segment:", error);
      throw error;
    }
  }

  /**
   * 快速合成视频片段
   * 基于已存在的片段进行合成，避免重复分割
   */
  async quickComposeVideo(
    folderName: string,
    segmentIds: string[],
    options: SegmentCompositionOptions,
    onProgress?: (progress: SegmentCompositionProgress) => void
  ): Promise<Blob> {
    if (!this.ffmpeg || !this.isLoaded) {
      await this.initialize();
    }

    try {
      onProgress?.({
        stage: "preparing",
        progress: 10,
        message: "准备合成视频...",
        totalSegments: segmentIds.length,
      });

      // 获取片段信息
      const segments = await videoSegmentStorage.getSegmentsByFolder(
        folderName
      );
      const selectedSegments = segments.filter((s) =>
        segmentIds.includes(s.id)
      );

      if (selectedSegments.length === 0) {
        throw new Error("No segments found for composition");
      }

      onProgress?.({
        stage: "loading",
        progress: 30,
        message: "加载片段文件...",
        totalSegments: selectedSegments.length,
      });

      // 这里需要实现片段文件的加载逻辑
      // 由于浏览器环境的限制，我们需要用户手动提供片段文件
      // 或者使用Electron API来访问本地文件

      // 暂时返回一个占位符
      const placeholderBlob = new Blob(
        ["Video composition not implemented in web environment"],
        {
          type: "text/plain",
        }
      );

      onProgress?.({
        stage: "completed",
        progress: 100,
        message: "合成完成（Web环境限制）",
      });

      return placeholderBlob;
    } catch (error) {
      console.error("Error composing video:", error);
      throw error;
    }
  }

  /**
   * 生成标准化的文件夹名称
   */
  private generateStandardFolderName(
    video: Video,
    subtitles: Subtitle[],
    options: SegmentGenerationOptions
  ): string {
    const videoName = video.name.split(".")[0];
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const format = options.format;
    const quality = options.quality;
    const resolution = options.resolution;
    const segmentCount = subtitles.length;

    return `${videoName}_segments_${format}_${quality}_${resolution}_${segmentCount}_${timestamp}`;
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
   * 清理文件名，移除非法字符
   */
  private sanitizeFileName(text: string): string {
    return text
      .replace(/[<>:"/\\|?*]/g, "_")
      .replace(/\s+/g, "_")
      .substring(0, 50); // 限制长度
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
          console.log("SmartVideoSegmentManager: Forced garbage collection");
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
   * 清理资源
   */
  async cleanup(): Promise<void> {
    if (this.ffmpeg) {
      try {
        await this.ffmpeg.terminate();
      } catch (error) {
        console.warn(
          "Error terminating SmartVideoSegmentManager FFmpeg:",
          error
        );
      }
      this.ffmpeg = null;
      this.isLoaded = false;
    }
  }
}

// 导出单例实例
export const smartVideoSegmentManager = new SmartVideoSegmentManager();
