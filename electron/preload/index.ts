import { contextBridge, ipcRenderer } from "electron";

// 定义 Electron API 的类型
declare global {
  interface Window {
    electronAPI: {
      // 视频处理
      processVideoSegments: (segments: any[], options: any) => Promise<any>;

      // 系统信息
      getHardwareInfo: () => Promise<any>;

      // 文件操作
      saveVideo: (videoData: Buffer, filename: string) => Promise<string>;

      // 数据库操作
      saveSubtitleRecord: (record: any) => Promise<void>;
      getSubtitleRecords: () => Promise<any[]>;

      // 进度监听
      onProgress: (callback: (progress: any) => void) => void;
      onError: (callback: (error: any) => void) => void;

      // 移除监听器
      removeAllListeners: (channel: string) => void;
    };
  }
}

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld("electronAPI", {
  // 视频处理
  processVideoSegments: (segments: any[], options: any) =>
    ipcRenderer.invoke("video:process-segments", segments, options),

  // 系统信息
  getHardwareInfo: () => ipcRenderer.invoke("system:get-hardware-info"),

  // 文件操作
  saveVideo: (videoData: Buffer, filename: string) =>
    ipcRenderer.invoke("file:save-video", videoData, filename),

  // 数据库操作
  saveSubtitleRecord: (record: any) =>
    ipcRenderer.invoke("database:save-subtitle-record", record),

  getSubtitleRecords: () => ipcRenderer.invoke("database:get-subtitle-records"),

  // 进度监听
  onProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on("progress:update", (event, progress) => callback(progress));
  },

  onError: (callback: (error: any) => void) => {
    ipcRenderer.on("error:update", (event, error) => callback(error));
  },

  // 移除监听器
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
