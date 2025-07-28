import { contextBridge, ipcRenderer } from "electron";

// 简化的 Electron API 用于测试
contextBridge.exposeInMainWorld("electronAPI", {
  // 测试用的简单方法
  testConnection: () => "Electron API is working!",

  // 模拟视频处理方法
  processVideoSegments: (segments: any[], options: any) => {
    console.log("Video processing requested:", { segments, options });
    return Promise.resolve(Buffer.from("test video data"));
  },

  // 模拟硬件信息获取
  getHardwareInfo: () => {
    return Promise.resolve({
      hasNVIDIA: false,
      hasAMD: false,
      hasIntel: false,
      hasApple: false,
      supportedCodecs: ["libx264"],
    });
  },

  // 模拟文件保存
  saveVideo: (videoData: Buffer, filename: string) => {
    console.log("Video save requested:", { filename, size: videoData.length });
    return Promise.resolve("/path/to/saved/video.mp4");
  },

  // 进度监听
  onProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on("progress:update", (event, progress) => callback(progress));
  },

  // 错误监听
  onError: (callback: (error: any) => void) => {
    ipcRenderer.on("error:update", (event, error) => callback(error));
  },

  // 移除监听器
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
