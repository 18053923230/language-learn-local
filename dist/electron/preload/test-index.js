"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// 简化的 Electron API 用于测试
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    // 测试用的简单方法
    testConnection: () => "Electron API is working!",
    // 模拟视频处理方法
    processVideoSegments: (segments, options) => {
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
    saveVideo: (videoData, filename) => {
        console.log("Video save requested:", { filename, size: videoData.length });
        return Promise.resolve("/path/to/saved/video.mp4");
    },
    // 进度监听
    onProgress: (callback) => {
        electron_1.ipcRenderer.on("progress:update", (event, progress) => callback(progress));
    },
    // 错误监听
    onError: (callback) => {
        electron_1.ipcRenderer.on("error:update", (event, error) => callback(error));
    },
    // 移除监听器
    removeAllListeners: (channel) => {
        electron_1.ipcRenderer.removeAllListeners(channel);
    },
});
