// 检测是否在 Electron 环境中运行
export const isElectron = (): boolean => {
  return typeof window !== "undefined" && !!(window as any).electronAPI;
};

// 检测是否在开发环境中运行
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === "development";
};

// 获取视频生成器实例
export const getVideoGenerator = async () => {
  if (isElectron()) {
    // 在 Electron 环境中，使用桌面版本的视频生成器
    const { ElectronVideoGenerator } = await import(
      "./electron-video-generator"
    );
    return new ElectronVideoGenerator();
  } else {
    // 在 Web 环境中，使用现有的视频生成器
    const { VideoGenerator } = await import("./video-generator");
    return new VideoGenerator();
  }
};

// 获取字幕存储服务
export const getSubtitleStorage = async () => {
  // 暂时都使用 Web 版本的存储服务
  const subtitleStorage = await import("./subtitle-storage");
  return subtitleStorage;
};

// 获取视频存储服务
export const getVideoStorage = async () => {
  // 暂时都使用 Web 版本的视频存储
  const { videoStorageService } = await import("./video-storage");
  return videoStorageService;
};

// 获取性能优化器
export const getPerformanceOptimizer = async () => {
  // 暂时都使用 Web 版本的性能优化器
  const { videoPerformanceOptimizer } = await import(
    "./video-performance-optimizer"
  );
  return videoPerformanceOptimizer;
};

// 平台信息
export const getPlatformInfo = () => {
  return {
    isElectron: isElectron(),
    isDevelopment: isDevelopment(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    platform: typeof process !== "undefined" ? process.platform : "unknown",
  };
};
