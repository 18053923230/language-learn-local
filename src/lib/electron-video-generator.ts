import {
  VideoGenerationOptions,
  VideoGenerationProgress,
  VideoSegment,
} from "./video-generator";

export class ElectronVideoGenerator {
  async generateFromMultipleVideos(
    segments: VideoSegment[],
    options: VideoGenerationOptions = {},
    onProgress?: (progress: VideoGenerationProgress) => void
  ): Promise<Blob> {
    if (!(window as any).electronAPI) {
      throw new Error("Electron API not available");
    }

    try {
      // 通过 Electron API 调用主进程的视频处理
      const videoBuffer = await (
        window as any
      ).electronAPI.processVideoSegments(segments, options);

      // 将 Buffer 转换为 Blob
      return new Blob([videoBuffer], {
        type: `video/${options.outputFormat || "mp4"}`,
      });
    } catch (error) {
      console.error("Electron video generation failed:", error);
      throw error;
    }
  }

  async generateFromSingleVideo(
    videoFile: File,
    subtitles: any[],
    options: VideoGenerationOptions = {},
    onProgress?: (progress: VideoGenerationProgress) => void
  ): Promise<Blob> {
    // 将单个视频的字幕转换为视频片段
    const segments: VideoSegment[] = subtitles.map((subtitle) => ({
      subtitle,
      videoFile,
      startTime: subtitle.startTime,
      endTime: subtitle.endTime,
    }));

    return this.generateFromMultipleVideos(segments, options, onProgress);
  }

  async cleanup(): Promise<void> {
    // Electron 版本不需要特殊的清理逻辑
  }
}
