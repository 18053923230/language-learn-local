import { spawn, spawnSync } from "child_process";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

export interface HardwareAccelerationInfo {
  hasNVIDIA: boolean;
  hasAMD: boolean;
  hasIntel: boolean;
  hasApple: boolean;
  supportedCodecs: string[];
}

export interface VideoExtractionOptions {
  quality?: "low" | "medium" | "high";
  useHardwareAcceleration?: boolean;
  preset?: string;
  crf?: number;
  audioBitrate?: string;
}

export interface VideoCombinationOptions {
  quality?: "low" | "medium" | "high";
  useHardwareAcceleration?: boolean;
  addTransitions?: boolean;
  transitionDuration?: number;
}

export class FFmpegService {
  private ffmpegPath: string;

  constructor() {
    this.ffmpegPath = this.getFFmpegPath();
  }

  private getFFmpegPath(): string {
    // 优先使用系统安装的 FFmpeg
    const systemFFmpeg = this.findSystemFFmpeg();
    if (systemFFmpeg) return systemFFmpeg;

    // 使用打包的 FFmpeg
    const packagedFFmpeg = this.getPackagedFFmpegPath();
    if (packagedFFmpeg) return packagedFFmpeg;

    throw new Error("FFmpeg not found");
  }

  private findSystemFFmpeg(): string | null {
    const possiblePaths = [
      "ffmpeg",
      "C:\\ffmpeg\\bin\\ffmpeg.exe",
      "/usr/bin/ffmpeg",
      "/usr/local/bin/ffmpeg",
    ];

    for (const ffmpegPath of possiblePaths) {
      try {
        const result = spawnSync(ffmpegPath, ["-version"], { stdio: "pipe" });
        if (result.status === 0) {
          return ffmpegPath;
        }
      } catch (error) {
        // 继续尝试下一个路径
      }
    }

    return null;
  }

  private getPackagedFFmpegPath(): string | null {
    try {
      // 在开发环境中
      const devPath = path.join(
        process.cwd(),
        "node_modules",
        "@ffmpeg-installer",
        "ffmpeg",
        "ffmpeg.exe"
      );
      if (fs.existsSync(devPath)) {
        return devPath;
      }

      // 在打包后的应用中
      const appPath = path.join(process.resourcesPath, "ffmpeg.exe");
      if (fs.existsSync(appPath)) {
        return appPath;
      }
    } catch (error) {
      console.error("Error finding packaged FFmpeg:", error);
    }

    return null;
  }

  async detectHardwareAcceleration(): Promise<HardwareAccelerationInfo> {
    try {
      const result = await this.exec(["-hide_banner", "-hwaccels"]);
      return this.parseHardwareAcceleration(result);
    } catch (error) {
      console.error("Hardware acceleration detection failed:", error);
      return {
        hasNVIDIA: false,
        hasAMD: false,
        hasIntel: false,
        hasApple: false,
        supportedCodecs: [],
      };
    }
  }

  private parseHardwareAcceleration(output: string): HardwareAccelerationInfo {
    const hasNVIDIA = output.includes("cuda") || output.includes("nvenc");
    const hasAMD = output.includes("amf") || output.includes("amf_h264");
    const hasIntel = output.includes("qsv") || output.includes("intel_qsv");
    const hasApple = output.includes("videotoolbox");

    const supportedCodecs: string[] = [];
    if (hasNVIDIA) supportedCodecs.push("h264_nvenc", "hevc_nvenc");
    if (hasAMD) supportedCodecs.push("h264_amf", "hevc_amf");
    if (hasIntel) supportedCodecs.push("h264_qsv", "hevc_qsv");
    if (hasApple)
      supportedCodecs.push("h264_videotoolbox", "hevc_videotoolbox");

    return {
      hasNVIDIA,
      hasAMD,
      hasIntel,
      hasApple,
      supportedCodecs,
    };
  }

  async extractVideoSegment(
    inputPath: string,
    outputPath: string,
    startTime: number,
    duration: number,
    options: VideoExtractionOptions = {}
  ): Promise<void> {
    const {
      quality = "medium",
      useHardwareAcceleration = false,
      preset = "ultrafast",
      crf = 23,
      audioBitrate = "128k",
    } = options;

    // 复用现有的质量设置逻辑
    const qualitySettings = this.getQualitySettings(quality);
    const hardwareSettings = useHardwareAcceleration
      ? this.getHardwareSettings()
      : [];

    const args = [
      "-i",
      inputPath,
      "-ss",
      startTime.toString(),
      "-t",
      duration.toString(),
      ...hardwareSettings,
      "-preset",
      preset,
      "-crf",
      crf.toString(),
      "-b:a",
      audioBitrate,
      "-movflags",
      "+faststart",
      "-y",
      outputPath,
    ];

    await this.exec(args);
  }

  async combineVideos(
    inputFiles: string[],
    outputPath: string,
    options: VideoCombinationOptions = {}
  ): Promise<void> {
    const {
      quality = "medium",
      useHardwareAcceleration = false,
      addTransitions = true,
      transitionDuration = 0.5,
    } = options;

    // 创建文件列表
    const fileListPath = path.join(os.tmpdir(), `filelist_${Date.now()}.txt`);
    const fileListContent = inputFiles
      .map((file) => `file '${file}'`)
      .join("\n");
    fs.writeFileSync(fileListPath, fileListContent);

    const qualitySettings = this.getQualitySettings(quality);
    const hardwareSettings = useHardwareAcceleration
      ? this.getHardwareSettings()
      : [];

    const args = [
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      fileListPath,
      ...hardwareSettings,
      "-preset",
      "ultrafast",
      "-crf",
      "23",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      "-y",
      outputPath,
    ];

    try {
      await this.exec(args);
    } finally {
      // 清理临时文件
      if (fs.existsSync(fileListPath)) {
        fs.unlinkSync(fileListPath);
      }
    }
  }

  private getQualitySettings(quality: string): string[] {
    switch (quality) {
      case "low":
        return ["-crf", "28", "-preset", "ultrafast"];
      case "high":
        return ["-crf", "18", "-preset", "medium"];
      case "medium":
      default:
        return ["-crf", "23", "-preset", "fast"];
    }
  }

  private getHardwareSettings(): string[] {
    // 检测硬件加速并返回相应的编码器设置
    // 这里可以根据 detectHardwareAcceleration 的结果来设置
    return ["-c:v", "libx264"]; // 默认使用 CPU 编码
  }

  private async exec(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.ffmpegPath, args);
      let stdout = "";
      let stderr = "";

      process.stdout?.on("data", (data) => (stdout += data.toString()));
      process.stderr?.on("data", (data) => (stderr += data.toString()));

      process.on("close", (code) => {
        if (code === 0) resolve(stdout);
        else reject(new Error(`FFmpeg failed: ${stderr}`));
      });

      process.on("error", (error) => {
        reject(new Error(`FFmpeg process error: ${error.message}`));
      });
    });
  }
}
