import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Subtitle } from "@/types/subtitle";
import { RawTranscriptionData, WordData } from "@/types/raw-transcription";
import { VerticalVideoCache } from "./vertical-video-cache";

export interface VerticalVideoOptions {
  outputFormat?: "mp4" | "webm";
  quality?: "low" | "medium" | "high";
  backgroundColor?: string; // 背景颜色，默认黑色
  subtitleColor?: string; // 字幕颜色，默认白色
  highlightColor?: string; // 高亮颜色，默认黄色
  fontSize?: number; // 字体大小，默认24
  scrollSpeed?: number; // 滚动速度（像素/秒），默认30
  videoWidth?: number; // 视频宽度，默认1080
  videoHeight?: number; // 视频高度，默认1920
  audioVolume?: number; // 音频音量，默认1.0
  subtitlePosition?: "center" | "bottom"; // 字幕位置
  showWordTiming?: boolean; // 是否显示单词时间轴
}

export interface VerticalVideoProgress {
  stage: "preparing" | "processing" | "generating" | "finalizing" | "completed";
  progress: number;
  message: string;
  currentStep?: number;
  totalSteps?: number;
}

export class VerticalVideoGenerator {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;

  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    try {
      this.ffmpeg = new FFmpeg();

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
      console.log("VerticalVideoGenerator FFmpeg loaded successfully");
    } catch (error) {
      console.error("Failed to load VerticalVideoGenerator FFmpeg:", error);
      throw new Error("Failed to initialize vertical video generator");
    }
  }

  /**
   * 生成竖屏学习视频
   */
  async generateVerticalVideo(
    audioFile: File,
    rawTranscriptionData: RawTranscriptionData,
    subtitles: Subtitle[],
    options: VerticalVideoOptions = {},
    onProgress?: (progress: VerticalVideoProgress) => void
  ): Promise<Blob> {
    if (!this.ffmpeg || !this.isLoaded) {
      await this.initialize();
    }

    const {
      outputFormat = "mp4",
      quality = "medium",
      backgroundColor = "#000000",
      subtitleColor = "#FFFFFF",
      highlightColor = "#FFFF00",
      fontSize = 24,
      scrollSpeed = 30,
      videoWidth = 1080,
      videoHeight = 1920,
      audioVolume = 1.0,
      subtitlePosition = "center",
      showWordTiming = true,
    } = options;

    // 检查缓存
    const videoId = VerticalVideoCache.generateVideoId(audioFile);
    if (VerticalVideoCache.hasCache(videoId)) {
      console.log("Using cached data for video:", videoId);
      onProgress?.({
        stage: "preparing",
        progress: 20,
        message: "从缓存加载数据...",
        totalSteps: 4,
      });

      const cachedData = await VerticalVideoCache.getCache(videoId);
      if (cachedData) {
        // 使用缓存的数据重新生成视频
        return await this.generateFromCachedData(
          cachedData.audioBlob,
          cachedData.rawTranscriptionData,
          cachedData.subtitles,
          options,
          onProgress
        );
      }
    }

    try {
      onProgress?.({
        stage: "preparing",
        progress: 10,
        message: "准备生成竖屏视频...",
        totalSteps: 4,
      });

      // 1. 准备音频文件
      const audioFileName = await this.prepareAudio(audioFile, audioVolume);

      onProgress?.({
        stage: "processing",
        progress: 30,
        message: "处理字幕和单词数据...",
        currentStep: 2,
        totalSteps: 4,
      });

      // 2. 生成字幕滤镜
      const subtitleFilter = this.generateSubtitleFilter(
        subtitles,
        rawTranscriptionData.assemblyData.words || [],
        {
          backgroundColor,
          subtitleColor,
          highlightColor,
          fontSize,
          scrollSpeed,
          videoWidth,
          videoHeight,
          subtitlePosition,
          showWordTiming,
        }
      );

      onProgress?.({
        stage: "generating",
        progress: 60,
        message: "生成视频...",
        currentStep: 3,
        totalSteps: 4,
      });

      // 保存到缓存
      try {
        await VerticalVideoCache.setCache(
          videoId,
          audioFile,
          rawTranscriptionData,
          subtitles
        );
        console.log("Data cached successfully for video:", videoId);
      } catch (cacheError) {
        console.warn("Failed to cache data:", cacheError);
      }

      // 3. 生成视频（带字幕版本）
      const outputFileName = `vertical_video.${outputFormat}`;
      const audioDuration =
        rawTranscriptionData.assemblyData.audio_duration || 60;

      // 根据质量设置调整参数
      const getQualitySettings = (quality: string) => {
        switch (quality) {
          case "low":
            return { crf: "45", audioBitrate: "64k", preset: "ultrafast" };
          case "medium":
            return { crf: "32", audioBitrate: "128k", preset: "fast" };
          case "high":
            return { crf: "23", audioBitrate: "192k", preset: "medium" };
          default:
            return { crf: "45", audioBitrate: "64k", preset: "ultrafast" };
        }
      };

      const qualitySettings = getQualitySettings(quality);

      // 生成带字幕的视频（使用更简单的方法）
      const videoArgs = [
        "-f",
        "lavfi",
        "-i",
        `color=c=${backgroundColor}:s=${videoWidth}x${videoHeight}:d=${audioDuration}`, // 使用完整音频时长
        "-i",
        audioFileName,
        "-c:v",
        "libx264",
        "-preset",
        qualitySettings.preset,
        "-crf",
        qualitySettings.crf,
        "-c:a",
        "aac",
        "-b:a",
        qualitySettings.audioBitrate,
        "-shortest",
        "-y",
        outputFileName,
      ];

      console.log("FFmpeg video args:", videoArgs);
      console.log("Subtitle filter:", subtitleFilter);

      try {
        await this.ffmpeg!.exec(videoArgs);
        console.log("FFmpeg execution completed successfully");

        // 如果基础视频生成成功，尝试添加字幕
        if (subtitleFilter && subtitleFilter.length > 0) {
          console.log("Attempting to add subtitles...");
          console.log("Subtitle filter:", subtitleFilter);

          // 直接使用字幕滤镜生成最终视频
          const finalOutputFileName = `final_${outputFileName}`;
          const finalArgs = [
            "-f",
            "lavfi",
            "-i",
            `color=c=${backgroundColor}:s=${videoWidth}x${videoHeight}:d=${audioDuration}`,
            "-i",
            audioFileName,
            "-vf",
            subtitleFilter,
            "-c:v",
            "libx264",
            "-preset",
            qualitySettings.preset,
            "-crf",
            qualitySettings.crf,
            "-c:a",
            "aac",
            "-b:a",
            qualitySettings.audioBitrate,
            "-shortest",
            "-y",
            finalOutputFileName,
          ];

          try {
            await this.ffmpeg!.exec(finalArgs);
            console.log("Final video with subtitles generated successfully");

            // 检查最终文件
            try {
              const finalData = await this.ffmpeg!.readFile(
                finalOutputFileName
              );
              console.log(
                "Final file size:",
                finalData instanceof Uint8Array
                  ? finalData.byteLength
                  : finalData.length
              );

              if (
                (finalData instanceof Uint8Array && finalData.byteLength > 0) ||
                (typeof finalData === "string" && finalData.length > 0)
              ) {
                // 替换原文件
                await this.ffmpeg!.deleteFile(outputFileName);
                await this.ffmpeg!.writeFile(outputFileName, finalData);
                console.log("Final file replaced successfully");
              } else {
                console.warn("Final file is empty, keeping original file");
              }
            } catch (readError) {
              console.warn("Failed to read final file:", readError);
            }

            // 清理最终文件
            try {
              await this.ffmpeg!.deleteFile(finalOutputFileName);
            } catch (cleanupError) {
              console.warn("Failed to cleanup final file:", cleanupError);
            }
          } catch (finalError) {
            console.warn(
              "Failed to generate final video with subtitles, using base video:",
              finalError
            );
          }
        }
      } catch (error) {
        console.error("FFmpeg execution failed:", error);

        // 如果带字幕的生成失败，尝试生成不带字幕的版本
        console.log("Trying without subtitles...");
        const simpleArgs = [
          "-f",
          "lavfi",
          "-i",
          `color=c=${backgroundColor}:s=${videoWidth}x${videoHeight}:d=${audioDuration}`,
          "-i",
          audioFileName,
          "-c:v",
          "libx264",
          "-preset",
          qualitySettings.preset,
          "-crf",
          qualitySettings.crf,
          "-c:a",
          "aac",
          "-b:a",
          qualitySettings.audioBitrate,
          "-shortest",
          "-y",
          outputFileName,
        ];

        await this.ffmpeg!.exec(simpleArgs);
        console.log("Simple video generation completed");
      }

      onProgress?.({
        stage: "finalizing",
        progress: 90,
        message: "完成视频生成...",
        currentStep: 4,
        totalSteps: 4,
      });

      // 4. 读取输出文件
      try {
        // 先检查文件是否存在
        console.log("Checking if output file exists:", outputFileName);

        // 列出所有文件以调试
        try {
          const files = await this.ffmpeg!.listDir("/");
          console.log("Available files:", files);

          // 检查是否有我们的输出文件
          const hasOutputFile = files.some(
            (file: any) => file.name === outputFileName
          );
          console.log(`Output file ${outputFileName} exists:`, hasOutputFile);

          // 列出所有文件名
          const fileNames = files.map((file: any) => file.name);
          console.log("File names:", fileNames);
        } catch (listError) {
          console.warn("Could not list files:", listError);
        }

        const data = await this.ffmpeg!.readFile(outputFileName);
        console.log(
          "Output file size:",
          data instanceof Uint8Array ? data.byteLength : data.length
        );

        if (
          (data instanceof Uint8Array && data.byteLength === 0) ||
          (typeof data === "string" && data.length === 0)
        ) {
          throw new Error("Generated video file is empty");
        }

        const videoBlob = new Blob([data], { type: `video/${outputFormat}` });
        console.log("Video blob size:", videoBlob.size);

        // 清理临时文件
        await this.cleanupTempFiles([audioFileName, outputFileName]);

        onProgress?.({
          stage: "completed",
          progress: 100,
          message: "竖屏视频生成完成！",
        });

        return videoBlob;
      } catch (error) {
        console.error("Error reading output file:", error);

        // 尝试生成一个更简单的测试视频
        console.log("Attempting to generate a simple test video...");
        try {
          const testOutputFileName = "test_output.mp4";
          const testArgs = [
            "-f",
            "lavfi",
            "-i",
            `color=c=${backgroundColor}:s=640x480:d=5`,
            "-c:v",
            "libx264",
            "-preset",
            "ultrafast",
            "-crf",
            "32",
            "-y",
            testOutputFileName,
          ];

          await this.ffmpeg!.exec(testArgs);
          console.log("Test video generated successfully");

          const testData = await this.ffmpeg!.readFile(testOutputFileName);
          const testBlob = new Blob([testData], { type: "video/mp4" });

          // 清理测试文件
          await this.cleanupTempFiles([testOutputFileName]);

          console.log("Test video blob size:", testBlob.size);

          onProgress?.({
            stage: "completed",
            progress: 100,
            message: "测试视频生成完成！",
          });

          return testBlob;
        } catch (testError) {
          console.error("Test video generation also failed:", testError);
          throw new Error("Failed to generate any video file");
        }
      }
    } catch (error) {
      console.error("Error generating vertical video:", error);
      throw new Error("Failed to generate vertical video");
    }
  }

  /**
   * 准备音频文件
   */
  private async prepareAudio(audioFile: File, volume: number): Promise<string> {
    const audioFileName = "input_audio.wav";

    // 写入音频文件
    await this.ffmpeg!.writeFile(audioFileName, await fetchFile(audioFile));

    // 如果需要调整音量
    if (volume !== 1.0) {
      const adjustedAudioFileName = "adjusted_audio.wav";
      const args = [
        "-i",
        audioFileName,
        "-filter:a",
        `volume=${volume}`,
        "-y",
        adjustedAudioFileName,
      ];

      await this.ffmpeg!.exec(args);
      await this.ffmpeg!.deleteFile(audioFileName);
      return adjustedAudioFileName;
    }

    return audioFileName;
  }

  /**
   * 生成字幕滤镜
   */
  private generateSubtitleFilter(
    subtitles: Subtitle[],
    words: WordData[],
    options: {
      backgroundColor: string;
      subtitleColor: string;
      highlightColor: string;
      fontSize: number;
      scrollSpeed: number;
      videoWidth: number;
      videoHeight: number;
      subtitlePosition: string;
      showWordTiming: boolean;
    }
  ): string {
    const {
      subtitleColor,
      highlightColor,
      fontSize,
      scrollSpeed,
      videoWidth,
      videoHeight,
      subtitlePosition,
      showWordTiming,
    } = options;

    try {
      // 限制字幕数量以避免滤镜过于复杂
      const maxSubtitles = 30;
      const limitedSubtitles = subtitles.slice(0, maxSubtitles);

      // 创建字幕文本
      const subtitleTexts = limitedSubtitles.map((subtitle, index) => {
        let text = subtitle.text;

        // 如果启用了单词时间轴，添加时间信息
        if (showWordTiming) {
          const startTime = Math.floor(subtitle.start);
          text = `[${startTime}s] ${text}`;
        }

        return {
          text,
          start: subtitle.start,
          end: subtitle.end,
        };
      });

      // 构建字幕滤镜
      let filterComplex = "";

      // 为每个字幕创建文本层（显示前3个字幕）
      const displaySubtitles = subtitleTexts.slice(0, 3); // 显示前3个字幕
      if (displaySubtitles.length > 0) {
        const filters = displaySubtitles.map((subtitle, index) => {
          const yPosition =
            subtitlePosition === "center"
              ? videoHeight / 2 + (index - 1) * 100
              : videoHeight - 200 - index * 80;

          // 创建字幕文本（简化版本，移除时间轴信息）
          const simpleText = subtitle.text.replace(/^\[.*?\]\s*/, ""); // 移除时间轴信息

          return `drawtext=text='${this.escapeText(
            simpleText
          )}':fontsize=${fontSize}:fontcolor=white:x=(w-text_w)/2:y=${yPosition}:enable='between(t,${
            subtitle.start
          },${subtitle.end})'`;
        });

        filterComplex = filters.join(",");
        console.log(
          "Generated subtitle filter with",
          displaySubtitles.length,
          "subtitles:",
          filterComplex
        );
      }

      // 暂时移除单词高亮，先确保基本字幕功能正常
      // TODO: 在基本功能稳定后重新添加单词高亮

      // 如果滤镜为空，返回一个简单的文本
      if (!filterComplex) {
        filterComplex = `drawtext=text='No subtitles available':fontsize=${fontSize}:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2`;
      }

      console.log("Generated subtitle filter:", filterComplex);
      return filterComplex;
    } catch (error) {
      console.error("Error generating subtitle filter:", error);
      // 返回一个简单的默认滤镜
      return `drawtext=text='Subtitle generation failed':fontsize=${fontSize}:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2`;
    }
  }

  /**
   * 计算单词在文本中的位置
   */
  private calculateWordPosition(fullText: string, word: string): number {
    const words = fullText.split(/\s+/);
    let position = 0;

    for (const w of words) {
      if (w.toLowerCase() === word.toLowerCase()) {
        return position;
      }
      position += w.length + 1; // +1 for space
    }

    return -1; // 未找到
  }

  /**
   * 转义文本中的特殊字符
   */
  private escapeText(text: string): string {
    return text
      .replace(/'/g, "\\'")
      .replace(/:/g, "\\:")
      .replace(/\[/g, "\\[")
      .replace(/\]/g, "\\]")
      .replace(/\$/g, "\\$")
      .replace(/"/g, '\\"')
      .replace(/\n/g, " ")
      .replace(/\r/g, " ")
      .replace(/\t/g, " ")
      .trim();
  }

  /**
   * 获取音频时长（秒）
   */
  private async getAudioDuration(audioFile: File): Promise<number> {
    try {
      // 写入音频文件到FFmpeg
      const tempAudioFile = "temp_audio.wav";
      await this.ffmpeg!.writeFile(tempAudioFile, await fetchFile(audioFile));

      // 获取音频信息
      const args = ["-i", tempAudioFile, "-f", "null", "-"];

      await this.ffmpeg!.exec(args);

      // 从FFmpeg输出中解析时长
      // 这里我们需要从FFmpeg的日志中获取时长信息
      // 由于FFmpeg.wasm的限制，我们使用一个简化的方法

      // 清理临时文件
      await this.ffmpeg!.deleteFile(tempAudioFile);

      // 如果无法获取准确时长，使用原始数据中的时长
      return 60; // 默认值，实际使用时应该从rawTranscriptionData获取
    } catch (error) {
      console.warn("Failed to get audio duration:", error);
      return 60; // 默认60秒
    }
  }

  /**
   * 清理临时文件
   */
  private async cleanupTempFiles(files: string[]): Promise<void> {
    for (const file of files) {
      try {
        await this.ffmpeg!.deleteFile(file);
      } catch (error) {
        console.warn(`Failed to delete temp file ${file}:`, error);
      }
    }
  }

  /**
   * 生成简单的测试视频（用于调试）
   */
  async generateTestVideo(
    audioFile: File,
    options: VerticalVideoOptions = {}
  ): Promise<Blob> {
    if (!this.ffmpeg || !this.isLoaded) {
      await this.initialize();
    }

    const {
      outputFormat = "mp4",
      backgroundColor = "#000000",
      videoWidth = 1080,
      videoHeight = 1920,
    } = options;

    try {
      console.log("Generating test video with subtitles...");

      // 准备音频文件
      const audioFileName = "test_audio.wav";
      await this.ffmpeg!.writeFile(audioFileName, await fetchFile(audioFile));

      // 首先生成基础视频
      const baseOutputFileName = `base_test_video.${outputFormat}`;
      const baseArgs = [
        "-f",
        "lavfi",
        "-i",
        `color=c=${backgroundColor}:s=${videoWidth}x${videoHeight}:d=10`, // 10秒测试
        "-i",
        audioFileName,
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "45",
        "-c:a",
        "aac",
        "-b:a",
        "64k",
        "-shortest",
        "-y",
        baseOutputFileName,
      ];

      console.log("Base test FFmpeg args:", baseArgs);
      await this.ffmpeg!.exec(baseArgs);
      console.log("Base test video generated successfully");

      // 然后尝试添加字幕
      const outputFileName = `test_video.${outputFormat}`;
      const subtitleArgs = [
        "-i",
        baseOutputFileName,
        "-vf",
        "drawtext=text='Test Subtitle':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "45",
        "-c:a",
        "copy",
        "-y",
        outputFileName,
      ];

      console.log("Subtitle test FFmpeg args:", subtitleArgs);
      await this.ffmpeg!.exec(subtitleArgs);

      // 读取输出文件
      const data = await this.ffmpeg!.readFile(outputFileName);
      const videoBlob = new Blob([data], { type: `video/${outputFormat}` });

      // 清理临时文件
      await this.cleanupTempFiles([
        audioFileName,
        baseOutputFileName,
        outputFileName,
      ]);

      console.log("Test video with subtitles generated successfully");
      return videoBlob;
    } catch (error) {
      console.error("Error generating test video:", error);

      // 如果字幕添加失败，返回基础视频
      try {
        console.log("Falling back to base video...");
        const baseData = await this.ffmpeg!.readFile(
          `base_test_video.${outputFormat}`
        );
        const baseBlob = new Blob([baseData], {
          type: `video/${outputFormat}`,
        });
        await this.cleanupTempFiles([`base_test_video.${outputFormat}`]);
        return baseBlob;
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        throw new Error("Failed to generate test video");
      }
    }
  }

  /**
   * 生成最简单的测试视频（仅测试文字渲染）
   */
  async generateSimpleTestVideo(): Promise<Blob> {
    if (!this.ffmpeg || !this.isLoaded) {
      await this.initialize();
    }

    try {
      console.log("Generating simple test video...");

      // 首先生成基础视频（不带字幕）
      const baseOutputFileName = "base_simple_test_video.mp4";
      const baseArgs = [
        "-f",
        "lavfi",
        "-i",
        "color=c=black:s=1080x1920:d=5",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "45",
        "-y",
        baseOutputFileName,
      ];

      console.log("Base simple test FFmpeg args:", baseArgs);
      await this.ffmpeg!.exec(baseArgs);
      console.log("Base simple test video generated successfully");

      // 检查基础视频是否生成成功
      try {
        const baseData = await this.ffmpeg!.readFile(baseOutputFileName);
        console.log(
          "Base video size:",
          baseData instanceof Uint8Array ? baseData.byteLength : baseData.length
        );

        if (
          (baseData instanceof Uint8Array && baseData.byteLength === 0) ||
          (typeof baseData === "string" && baseData.length === 0)
        ) {
          throw new Error("Base video is empty");
        }
      } catch (readError) {
        console.error("Failed to read base video:", readError);
        throw new Error("Base video generation failed");
      }

      // 尝试添加字幕
      const outputFileName = "simple_test_video.mp4";
      const subtitleArgs = [
        "-i",
        baseOutputFileName,
        "-vf",
        "drawtext=text='Hello World':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "45",
        "-y",
        outputFileName,
      ];

      console.log("Subtitle simple test FFmpeg args:", subtitleArgs);
      await this.ffmpeg!.exec(subtitleArgs);

      // 读取输出文件
      const data = await this.ffmpeg!.readFile(outputFileName);
      const videoBlob = new Blob([data], { type: "video/mp4" });

      // 清理临时文件
      await this.cleanupTempFiles([baseOutputFileName, outputFileName]);

      console.log("Simple test video generated successfully");
      return videoBlob;
    } catch (error) {
      console.error("Error generating simple test video:", error);

      // 如果字幕添加失败，返回基础视频
      try {
        console.log("Falling back to base simple video...");
        const baseData = await this.ffmpeg!.readFile(
          "base_simple_test_video.mp4"
        );
        const baseBlob = new Blob([baseData], { type: "video/mp4" });
        await this.cleanupTempFiles(["base_simple_test_video.mp4"]);
        return baseBlob;
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        throw new Error("Failed to generate simple test video");
      }
    }
  }

  /**
   * 从缓存数据生成视频
   */
  private async generateFromCachedData(
    audioBlob: Blob,
    rawTranscriptionData: RawTranscriptionData,
    subtitles: Subtitle[],
    options: VerticalVideoOptions = {},
    onProgress?: (progress: VerticalVideoProgress) => void
  ): Promise<Blob> {
    // 将Blob转换为File对象
    const audioFile = new File([audioBlob], "cached_audio.wav", {
      type: audioBlob.type,
    });

    // 使用现有的生成逻辑
    return await this.generateVerticalVideo(
      audioFile,
      rawTranscriptionData,
      subtitles,
      options,
      onProgress
    );
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    if (this.ffmpeg) {
      try {
        await this.ffmpeg.terminate();
      } catch (error) {
        console.warn("Error terminating VerticalVideoGenerator FFmpeg:", error);
      }
      this.ffmpeg = null;
      this.isLoaded = false;
    }
  }

  /**
   * 使用Canvas API生成带文字的视频（替代FFmpeg drawtext）
   */
  async generateCanvasVideo(
    audioFile: File,
    subtitles: Subtitle[],
    options: VerticalVideoOptions = {}
  ): Promise<Blob> {
    const {
      backgroundColor = "#000000",
      subtitleColor = "#FFFFFF",
      fontSize = 24,
      videoWidth = 1080,
      videoHeight = 1920,
      outputFormat = "mp4",
    } = options;

    try {
      console.log("Generating canvas video...");

      // 创建Canvas
      const canvas = document.createElement("canvas");
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      // 设置背景色
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, videoWidth, videoHeight);

      // 设置文字样式
      ctx.fillStyle = subtitleColor;
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // 显示前3条字幕
      const displaySubtitles = subtitles.slice(0, 3);
      displaySubtitles.forEach((subtitle, index) => {
        const yPosition = videoHeight / 2 + (index - 1) * 100;
        const text = subtitle.text.replace(/^\[.*?\]\s*/, ""); // 移除时间轴信息

        // 添加文字阴影以提高可读性
        ctx.shadowColor = "black";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillText(text, videoWidth / 2, yPosition);

        // 重置阴影
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      });

      // 将Canvas转换为Blob
      const canvasBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, "image/png");
      });

      // 将Canvas图像写入FFmpeg
      const imageFileName = "canvas_image.png";
      await this.ffmpeg!.writeFile(imageFileName, await fetchFile(canvasBlob));

      // 准备音频文件
      const audioFileName = await this.prepareAudio(audioFile, 1.0);

      // 生成视频（使用图像作为视频帧）
      const outputFileName = `canvas_video.${outputFormat}`;
      const audioDuration = await this.getAudioDuration(audioFile);

      const args = [
        "-loop",
        "1",
        "-i",
        imageFileName,
        "-i",
        audioFileName,
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "45",
        "-c:a",
        "aac",
        "-b:a",
        "64k",
        "-t",
        audioDuration.toString(),
        "-shortest",
        "-y",
        outputFileName,
      ];

      console.log("Canvas video FFmpeg args:", args);
      await this.ffmpeg!.exec(args);

      // 读取输出文件
      const data = await this.ffmpeg!.readFile(outputFileName);
      const videoBlob = new Blob([data], { type: `video/${outputFormat}` });

      // 清理临时文件
      await this.cleanupTempFiles([
        imageFileName,
        audioFileName,
        outputFileName,
      ]);

      console.log("Canvas video generated successfully");
      return videoBlob;
    } catch (error) {
      console.error("Error generating canvas video:", error);
      throw new Error("Failed to generate canvas video");
    }
  }
}

// 导出单例实例
export const verticalVideoGenerator = new VerticalVideoGenerator();
