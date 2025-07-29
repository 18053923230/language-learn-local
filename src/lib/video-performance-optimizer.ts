/**
 * 视频性能优化工具类
 * 提供硬件检测、性能监控和优化建议
 */

export interface PerformanceInfo {
  cpuCores: number;
  memoryGB: number;
  hasWebGL: boolean;
  hasWebGL2: boolean;
  hasWebCodecs: boolean;
  hasSharedArrayBuffer: boolean;
  hasNvidiaGPU: boolean;
  gpuInfo: string;
  browser: string;
  platform: string;
  userAgent: string;
}

export interface OptimizationRecommendations {
  useParallelProcessing: boolean;
  batchSize: number;
  useHardwareAcceleration: boolean;
  qualityPreset:
    | "ultrafast"
    | "superfast"
    | "veryfast"
    | "faster"
    | "fast"
    | "medium";
  crfValue: number;
  audioBitrate: string;
  maxConcurrentSegments: number;
}

export class VideoPerformanceOptimizer {
  private static instance: VideoPerformanceOptimizer;
  private performanceInfo: PerformanceInfo | null = null;

  private constructor() {}

  static getInstance(): VideoPerformanceOptimizer {
    if (!VideoPerformanceOptimizer.instance) {
      VideoPerformanceOptimizer.instance = new VideoPerformanceOptimizer();
    }
    return VideoPerformanceOptimizer.instance;
  }

  /**
   * 检测系统性能信息
   */
  async detectPerformanceInfo(): Promise<PerformanceInfo> {
    if (this.performanceInfo) {
      return this.performanceInfo;
    }

    const info: PerformanceInfo = {
      cpuCores: navigator.hardwareConcurrency || 4,
      memoryGB: this.estimateMemoryGB(),
      hasWebGL: this.detectWebGL(),
      hasWebGL2: this.detectWebGL2(),
      hasWebCodecs: this.detectWebCodecs(),
      hasSharedArrayBuffer: this.detectSharedArrayBuffer(),
      hasNvidiaGPU: this.detectNvidiaGPU(),
      gpuInfo: this.getGPUInfo(),
      browser: this.detectBrowser(),
      platform: navigator.platform,
      userAgent: navigator.userAgent,
    };

    this.performanceInfo = info;
    return info;
  }

  /**
   * 获取优化建议
   */
  getOptimizationRecommendations(): OptimizationRecommendations {
    const info = this.performanceInfo;
    if (!info) {
      // 默认配置
      return {
        useParallelProcessing: true,
        batchSize: 2,
        useHardwareAcceleration: false,
        qualityPreset: "ultrafast",
        crfValue: 25,
        audioBitrate: "96k",
        maxConcurrentSegments: 2,
      };
    }

    // 基于硬件配置的优化建议 - 压榨系统资源
    const recommendations: OptimizationRecommendations = {
      useParallelProcessing: info.cpuCores > 2,
      batchSize: Math.min(info.cpuCores, 8), // 8核处理器设置8个并行
      useHardwareAcceleration:
        (info.hasWebGL2 && info.hasWebCodecs) || info.hasNvidiaGPU,
      qualityPreset: this.getQualityPreset(info),
      crfValue: this.getCRFValue(info),
      audioBitrate: this.getAudioBitrate(info),
      maxConcurrentSegments: info.cpuCores, // 检测几核就几个并行
    };

    return recommendations;
  }

  /**
   * 获取 FFmpeg 优化参数
   */
  getFFmpegOptimizationArgs(): string[] {
    const recommendations = this.getOptimizationRecommendations();
    const info = this.performanceInfo;

    const args = [
      "-preset",
      "ultrafast", // 强制使用最快预设
      "-crf",
      "20", // 稍微降低质量以提高速度
      "-c:a",
      "aac",
      "-b:a",
      "64k", // 降低音频比特率
      "-movflags",
      "+faststart",
      "-threads",
      "8", // 强制使用8线程
      "-tune",
      "fastdecode", // 优化解码速度
    ];

    // 如果检测到NVIDIA GPU，添加硬件加速（仅在支持的环境中）
    if (info && info.hasNvidiaGPU && typeof window !== "undefined") {
      // 在Web环境中，硬件加速可能不稳定，暂时禁用
      // args.push("-hwaccel", "cuda");
      // args.push("-hwaccel_output_format", "cuda");
    }

    return args;
  }

  /**
   * 获取批处理大小
   */
  getOptimalBatchSize(): number {
    const recommendations = this.getOptimizationRecommendations();
    return recommendations.batchSize;
  }

  /**
   * 检查是否支持硬件加速
   */
  isHardwareAccelerationSupported(): boolean {
    const recommendations = this.getOptimizationRecommendations();
    return recommendations.useHardwareAcceleration;
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): string {
    const info = this.performanceInfo;
    const recommendations = this.getOptimizationRecommendations();

    if (!info) {
      return "Performance info not available";
    }

    return `
性能检测报告:
==============
CPU 核心数: ${info.cpuCores}
内存估计: ${info.memoryGB}GB
WebGL 支持: ${info.hasWebGL ? "是" : "否"}
WebGL2 支持: ${info.hasWebGL2 ? "是" : "否"}
WebCodecs 支持: ${info.hasWebCodecs ? "是" : "否"}
NVIDIA GPU: ${info.hasNvidiaGPU ? "是" : "否"}
GPU 信息: ${info.gpuInfo}
浏览器: ${info.browser}
平台: ${info.platform}

优化建议:
==========
并行处理: ${recommendations.useParallelProcessing ? "启用" : "禁用"}
批处理大小: ${recommendations.batchSize}
硬件加速: ${recommendations.useHardwareAcceleration ? "启用" : "禁用"}
质量预设: ${recommendations.qualityPreset}
CRF 值: ${recommendations.crfValue}
音频比特率: ${recommendations.audioBitrate}
最大并发片段: ${recommendations.maxConcurrentSegments}
    `.trim();
  }

  // 私有辅助方法

  private estimateMemoryGB(): number {
    // 基于可用内存估算
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.jsHeapSizeLimit / 1024 / 1024 / 1024);
    }

    // 基于用户代理估算
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("chrome")) return 4;
    if (ua.includes("firefox")) return 2;
    if (ua.includes("safari")) return 2;
    return 2;
  }

  private detectWebGL(): boolean {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      );
    } catch {
      return false;
    }
  }

  private detectWebGL2(): boolean {
    try {
      const canvas = document.createElement("canvas");
      return !!canvas.getContext("webgl2");
    } catch {
      return false;
    }
  }

  private detectWebCodecs(): boolean {
    return "VideoEncoder" in window && "VideoDecoder" in window;
  }

  private detectSharedArrayBuffer(): boolean {
    return typeof SharedArrayBuffer !== "undefined";
  }

  private detectNvidiaGPU(): boolean {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) return false;

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return renderer.toLowerCase().includes("nvidia");
      }
      return false;
    } catch {
      return false;
    }
  }

  private getGPUInfo(): string {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) return "Unknown";

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        return `${vendor} ${renderer}`;
      }
      return "Unknown";
    } catch {
      return "Unknown";
    }
  }

  private detectBrowser(): string {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("chrome")) return "Chrome";
    if (ua.includes("firefox")) return "Firefox";
    if (ua.includes("safari")) return "Safari";
    if (ua.includes("edge")) return "Edge";
    return "Unknown";
  }

  private getQualityPreset(
    info: PerformanceInfo
  ): "ultrafast" | "superfast" | "veryfast" | "faster" | "fast" | "medium" {
    if (info.cpuCores >= 8 && info.memoryGB >= 8) {
      return "fast";
    } else if (info.cpuCores >= 4 && info.memoryGB >= 4) {
      return "veryfast";
    } else {
      return "ultrafast";
    }
  }

  private getCRFValue(info: PerformanceInfo): number {
    if (info.cpuCores >= 8) {
      return 20;
    } else if (info.cpuCores >= 4) {
      return 23;
    } else {
      return 25;
    }
  }

  private getAudioBitrate(info: PerformanceInfo): string {
    if (info.memoryGB >= 8) {
      return "128k";
    } else if (info.memoryGB >= 4) {
      return "96k";
    } else {
      return "64k";
    }
  }
}

// 导出单例实例
export const videoPerformanceOptimizer =
  VideoPerformanceOptimizer.getInstance();
