import { spawn, SpawnOptions } from "child_process";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

export interface HardwareAccelerationInfo {
  hasNVIDIA: boolean;
  hasAMD: boolean;
  hasIntel: boolean;
  hasApple: boolean;
  availableEncoders: string[];
  recommendedEncoder: string;
  cpuCores: number;
  memoryGB: number;
}

export interface VideoExtractionOptions {
  quality?: "low" | "medium" | "high";
  useHardwareAcceleration?: boolean;
  encoder?: string;
  audioBitrate?: string;
  videoBitrate?: string;
}

export interface VideoCombinationOptions {
  outputFormat?: "mp4" | "webm" | "avi";
  quality?: "low" | "medium" | "high";
  useHardwareAcceleration?: boolean;
  addTransitions?: boolean;
  transitionDuration?: number;
}

export class FFmpegService {
  private ffmpegPath: string;
  private hardwareInfo: HardwareAccelerationInfo | null = null;

  constructor() {
    this.ffmpegPath = this.getFFmpegPath();
  }

  /**
   * 获取 FFmpeg 路径
   */
  private getFFmpegPath(): string {
    // 优先使用系统安装的 FFmpeg
    const systemFFmpeg = this.findSystemFFmpeg();
    if (systemFFmpeg) {
      return systemFFmpeg;
    }

    // 使用打包的 FFmpeg
    const packagedFFmpeg = this.getPackagedFFmpegPath();
    if (packagedFFmpeg && fs.existsSync(packagedFFmpeg)) {
      return packagedFFmpeg;
    }

    throw new Error(
      "FFmpeg not found. Please install FFmpeg or ensure it is bundled with the application."
    );
  }

  /**
   * 查找系统安装的 FFmpeg
   */
  private findSystemFFmpeg(): string | null {
    const possiblePaths = [
      "ffmpeg",
      "/usr/bin/ffmpeg",
      "/usr/local/bin/ffmpeg",
      "C:\\ffmpeg\\bin\\ffmpeg.exe",
      "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
    ];

    for (const ffmpegPath of possiblePaths) {
      try {
        const result = spawn.sync(ffmpegPath, ["-version"], { stdio: "pipe" });
        if (result.status === 0) {
          return ffmpegPath;
        }
      } catch {
        // 继续查找下一个路径
      }
    }

    return null;
  }

  /**
   * 获取打包的 FFmpeg 路径
   */
  private getPackagedFFmpegPath(): string {
    const platform = os.platform();
    const arch = os.arch();

    if (platform === "win32") {
      return path.join(process.resourcesPath, "ffmpeg.exe");
    } else if (platform === "darwin") {
      return path.join(process.resourcesPath, "ffmpeg");
    } else {
      return path.join(process.resourcesPath, "ffmpeg");
    }
  }

  /**
   * 执行 FFmpeg 命令
   */
  private async exec(
    args: string[],
    options: SpawnOptions = {}
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.ffmpegPath, args, {
        stdio: ["pipe", "pipe", "pipe"],
        ...options,
      });

      let stdout = "";
      let stderr = "";

      process.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      process.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      process.on("close", (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`FFmpeg failed with code ${code}: ${stderr}`));
        }
      });

      process.on("error", (error) => {
        reject(error);
      });
    });
  }

  /**
   * 检测硬件加速支持
   */
  async detectHardwareAcceleration(): Promise<HardwareAccelerationInfo> {
    if (this.hardwareInfo) {
      return this.hardwareInfo;
    }

    try {
      // 获取可用的硬件加速器
      const hwaccelsResult = await this.exec(["-hide_banner", "-hwaccels"]);
      const hwaccels = hwaccelsResult
        .trim()
        .split("\n")
        .filter((line) => line.trim());

      // 获取可用的编码器
      const encodersResult = await this.exec(["-hide_banner", "-encoders"]);
      const encoders = encodersResult
        .split("\n")
        .filter((line) => line.includes("h264"))
        .map((line) => line.trim().split(/\s+/)[1])
        .filter(Boolean);

      const platform = os.platform();
      const cpuCores = os.cpus().length;
      const memoryGB = Math.round(os.totalmem() / (1024 * 1024 * 1024));

      const hardwareInfo: HardwareAccelerationInfo = {
        hasNVIDIA: hwaccels.includes("cuda") || encoders.includes("h264_nvenc"),
        hasAMD: hwaccels.includes("amf") || encoders.includes("h264_amf"),
        hasIntel: hwaccels.includes("qsv") || encoders.includes("h264_qsv"),
        hasApple:
          platform === "darwin" &&
          (hwaccels.includes("videotoolbox") ||
            encoders.includes("h264_videotoolbox")),
        availableEncoders: encoders,
        recommendedEncoder: this.getRecommendedEncoder(
          hwaccels,
          encoders,
          platform
        ),
        cpuCores,
        memoryGB,
      };

      this.hardwareInfo = hardwareInfo;
      return hardwareInfo;
    } catch (error) {
      console.error("Error detecting hardware acceleration:", error);

      // 返回默认配置
      return {
        hasNVIDIA: false,
        hasAMD: false,
        hasIntel: false,
        hasApple: false,
        availableEncoders: ["libx264"],
        recommendedEncoder: "libx264",
        cpuCores: os.cpus().length,
        memoryGB: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
      };
    }
  }

  /**
   * 获取推荐的编码器
   */
  private getRecommendedEncoder(
    hwaccels: string[],
    encoders: string[],
    platform: string
  ): string {
    // 优先级：NVIDIA > AMD > Intel > Apple > CPU
    if (hwaccels.includes("cuda") || encoders.includes("h264_nvenc")) {
      return "h264_nvenc";
    }
    if (hwaccels.includes("amf") || encoders.includes("h264_amf")) {
      return "h264_amf";
    }
    if (hwaccels.includes("qsv") || encoders.includes("h264_qsv")) {
      return "h264_qsv";
    }
    if (
      platform === "darwin" &&
      (hwaccels.includes("videotoolbox") ||
        encoders.includes("h264_videotoolbox"))
    ) {
      return "h264_videotoolbox";
    }
    return "libx264";
  }

  /**
   * 提取视频片段（支持硬件加速）
   */
  async extractVideoSegment(
    inputPath: string,
    outputPath: string,
    startTime: number,
    duration: number,
    options: VideoExtractionOptions = {}
  ): Promise<void> {
    const {
      quality = "medium",
      useHardwareAcceleration = true,
      encoder,
      audioBitrate = "128k",
      videoBitrate,
    } = options;

    // 获取硬件信息
    const hardwareInfo = await this.detectHardwareAcceleration();

    // 选择编码器
    const selectedEncoder =
      encoder ||
      (useHardwareAcceleration ? hardwareInfo.recommendedEncoder : "libx264");

    // 构建 FFmpeg 参数
    const args = [
      "-i",
      inputPath,
      "-ss",
      startTime.toString(),
      "-t",
      duration.toString(),
      "-c:v",
      selectedEncoder,
      "-c:a",
      "aac",
      "-b:a",
      audioBitrate,
    ];

    // 添加质量设置
    if (selectedEncoder === "libx264") {
      const crf = quality === "high" ? 18 : quality === "medium" ? 23 : 28;
      args.push("-crf", crf.toString());
    } else {
      // 硬件编码器的质量设置
      const preset =
        quality === "high" ? "slow" : quality === "medium" ? "medium" : "fast";
      args.push("-preset", preset);
    }

    // 添加视频比特率（如果指定）
    if (videoBitrate) {
      args.push("-b:v", videoBitrate);
    }

    // 添加输出文件
    args.push("-y", outputPath);

    await this.exec(args);
  }

  /**
   * 合并视频文件
   */
  async combineVideos(
    inputFiles: string[],
    outputPath: string,
    options: VideoCombinationOptions = {}
  ): Promise<void> {
    const {
      outputFormat = "mp4",
      quality = "medium",
      useHardwareAcceleration = true,
      addTransitions = false,
      transitionDuration = 0.5,
    } = options;

    // 创建合并列表文件
    const concatListPath = path.join(os.tmpdir(), `concat_${Date.now()}.txt`);
    const concatContent = inputFiles.map((file) => `file '${file}'`).join("\n");
    fs.writeFileSync(concatListPath, concatContent);

    try {
      // 获取硬件信息
      const hardwareInfo = await this.detectHardwareAcceleration();
      const selectedEncoder = useHardwareAcceleration
        ? hardwareInfo.recommendedEncoder
        : "libx264";

      // 构建 FFmpeg 参数
      const args = [
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        concatListPath,
        "-c:v",
        selectedEncoder,
        "-c:a",
        "aac",
      ];

      // 添加质量设置
      if (selectedEncoder === "libx264") {
        const crf = quality === "high" ? 18 : quality === "medium" ? 23 : 28;
        args.push("-crf", crf.toString());
      } else {
        const preset =
          quality === "high"
            ? "slow"
            : quality === "medium"
            ? "medium"
            : "fast";
        args.push("-preset", preset);
      }

      // 添加输出文件
      args.push("-y", outputPath);

      await this.exec(args);
    } finally {
      // 清理临时文件
      if (fs.existsSync(concatListPath)) {
        fs.unlinkSync(concatListPath);
      }
    }
  }

  /**
   * 获取视频信息
   */
  async getVideoInfo(videoPath: string): Promise<any> {
    const result = await this.exec(["-i", videoPath, "-f", "null", "-"]);

    // 解析视频信息
    const durationMatch = result.match(
      /Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/
    );
    const resolutionMatch = result.match(/(\d{3,4})x(\d{3,4})/);
    const fpsMatch = result.match(/(\d+(?:\.\d+)?) fps/);

    return {
      duration: durationMatch
        ? parseInt(durationMatch[1]) * 3600 +
          parseInt(durationMatch[2]) * 60 +
          parseInt(durationMatch[3]) +
          parseInt(durationMatch[4]) / 100
        : 0,
      resolution: resolutionMatch
        ? {
            width: parseInt(resolutionMatch[1]),
            height: parseInt(resolutionMatch[2]),
          }
        : null,
      fps: fpsMatch ? parseFloat(fpsMatch[1]) : null,
    };
  }

  /**
   * 批量处理视频片段
   */
  async batchProcessSegments(
    segments: Array<{
      inputPath: string;
      outputPath: string;
      startTime: number;
      duration: number;
      options?: VideoExtractionOptions;
    }>,
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    const batchSize = Math.min(os.cpus().length, 4); // 限制并发数

    for (let i = 0; i < segments.length; i += batchSize) {
      const batch = segments.slice(i, i + batchSize);

      const batchPromises = batch.map(async (segment, batchIndex) => {
        await this.extractVideoSegment(
          segment.inputPath,
          segment.outputPath,
          segment.startTime,
          segment.duration,
          segment.options
        );
      });

      await Promise.all(batchPromises);
      onProgress?.(Math.min(i + batchSize, segments.length), segments.length);
    }
  }
}
