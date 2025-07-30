import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Subtitle } from "@/types/subtitle";
import { videoPerformanceOptimizer } from "./video-performance-optimizer";
import { FolderOpener } from "./folder-opener";

export interface VideoSegmentGenerationOptions {
  outputFormat?: "mp4" | "webm" | "avi";
  quality?: "low" | "medium" | "high";
  outputResolution?: "720p" | "1080p" | "480p";
  useOptimization?: boolean;
  parallelProcessing?: boolean;
}

export interface VideoSegmentGenerationProgress {
  stage: "preparing" | "processing" | "saving" | "completed";
  progress: number;
  message: string;
  currentSegment?: number;
  totalSegments?: number;
}

export interface GeneratedSegment {
  subtitle: Subtitle;
  filePath: string;
  fileName: string;
  duration: number;
  size: number;
}

export class VideoSegmentGenerator {
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
      console.log("VideoSegmentGenerator FFmpeg loaded successfully");
    } catch (error) {
      console.error("Failed to load VideoSegmentGenerator FFmpeg:", error);
      throw new Error("Failed to initialize video segment generator");
    }
  }

  /**
   * 生成视频片段并保存到指定文件夹
   */
  async generateSegments(
    videoFile: File,
    subtitles: Subtitle[],
    folderName: string,
    options: VideoSegmentGenerationOptions = {},
    onProgress?: (progress: VideoSegmentGenerationProgress) => void
  ): Promise<GeneratedSegment[]> {
    if (!this.ffmpeg || !this.isLoaded) {
      await this.initialize();
    }

    const {
      outputFormat = "mp4",
      quality = "medium",
      outputResolution = "720p",
    } = options;

    try {
      onProgress?.({
        stage: "preparing",
        progress: 5,
        message: "准备生成视频片段...",
        totalSegments: subtitles.length,
      });

      // 创建文件夹（在浏览器环境中，我们使用虚拟文件夹结构）
      const folderPath = `segments/${folderName}`;

      onProgress?.({
        stage: "processing",
        progress: 10,
        message: "开始处理视频片段...",
        currentSegment: 1,
        totalSegments: subtitles.length,
      });

      const generatedSegments: GeneratedSegment[] = [];

      // 处理每个字幕片段
      for (let i = 0; i < subtitles.length; i++) {
        const subtitle = subtitles[i];
        const segmentFileName = `segment_${i + 1}_${this.sanitizeFileName(
          subtitle.text
        )}.${outputFormat}`;
        const fullPath = `${folderPath}/${segmentFileName}`;

        try {
          // 写入原始视频文件
          await this.ffmpeg!.writeFile(
            "input_video",
            await fetchFile(videoFile)
          );

          // 使用性能优化器的 FFmpeg 参数
          const optimizationArgs =
            videoPerformanceOptimizer.getFFmpegOptimizationArgs();
          const qualityArgs = this.getQualitySettings(quality);
          const resolutionArgs = this.getResolutionSettings(outputResolution);

          const args = [
            "-i",
            "input_video",
            "-ss",
            subtitle.start.toString(),
            "-t",
            (subtitle.end - subtitle.start).toString(),
            ...optimizationArgs,
            ...qualityArgs,
            ...resolutionArgs,
            "-avoid_negative_ts",
            "make_zero",
            "-y",
            segmentFileName,
          ];

          await this.ffmpeg!.exec(args);

          // 读取生成的片段文件
          const segmentData = await this.ffmpeg!.readFile(segmentFileName);
          const segmentBlob = new Blob([segmentData], {
            type: `video/${outputFormat}`,
          });

          // 创建下载链接并触发下载
          const url = URL.createObjectURL(segmentBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = segmentFileName;
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          // 清理临时文件
          await this.ffmpeg!.deleteFile(segmentFileName);
          await this.ffmpeg!.deleteFile("input_video");

          // 记录生成的片段信息
          generatedSegments.push({
            subtitle,
            filePath: fullPath,
            fileName: segmentFileName,
            duration: subtitle.end - subtitle.start,
            size: segmentBlob.size,
          });

          onProgress?.({
            stage: "processing",
            progress: 10 + ((i + 1) / subtitles.length) * 80,
            message: `已生成片段 ${i + 1} / ${subtitles.length}`,
            currentSegment: i + 1,
            totalSegments: subtitles.length,
          });
        } catch (error) {
          console.error(`Error processing segment ${i + 1}:`, error);
          throw new Error(`Failed to process segment ${i + 1}`);
        }
      }

      onProgress?.({
        stage: "saving",
        progress: 95,
        message: "正在保存片段文件...",
      });

      // 创建片段信息文件
      const segmentsInfo = {
        folderName,
        totalSegments: generatedSegments.length,
        generatedAt: new Date().toISOString(),
        originalVideo: videoFile.name,
        segments: generatedSegments.map((segment) => ({
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
      infoLink.download = `${folderName}_segments_info.json`;
      infoLink.style.display = "none";
      document.body.appendChild(infoLink);
      infoLink.click();
      document.body.removeChild(infoLink);
      URL.revokeObjectURL(infoUrl);

      onProgress?.({
        stage: "completed",
        progress: 100,
        message: `成功生成 ${generatedSegments.length} 个视频片段！`,
      });

      // 尝试打开文件夹
      try {
        await FolderOpener.openFolder(folderPath);
      } catch (error) {
        console.warn("Failed to open folder:", error);
      }

      return generatedSegments;
    } catch (error) {
      console.error("Error generating video segments:", error);
      throw new Error("Failed to generate video segments");
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
        console.warn("Error terminating VideoSegmentGenerator FFmpeg:", error);
      }
      this.ffmpeg = null;
      this.isLoaded = false;
    }
  }
}

// 导出单例实例
export const videoSegmentGenerator = new VideoSegmentGenerator();
