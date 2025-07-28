"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// 暴露安全的 API 给渲染进程
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    // 视频处理
    processVideoSegments: (segments, options) => electron_1.ipcRenderer.invoke("video:process-segments", segments, options),
    // 系统信息
    getHardwareInfo: () => electron_1.ipcRenderer.invoke("system:get-hardware-info"),
    // 文件操作
    saveVideo: (videoData, filename) => electron_1.ipcRenderer.invoke("file:save-video", videoData, filename),
    // 数据库操作
    saveSubtitleRecord: (record) => electron_1.ipcRenderer.invoke("database:save-subtitle-record", record),
    getSubtitleRecords: () => electron_1.ipcRenderer.invoke("database:get-subtitle-records"),
    // 进度监听
    onProgress: (callback) => {
        electron_1.ipcRenderer.on("progress:update", (event, progress) => callback(progress));
    },
    onError: (callback) => {
        electron_1.ipcRenderer.on("error:update", (event, error) => callback(error));
    },
    // 移除监听器
    removeAllListeners: (channel) => {
        electron_1.ipcRenderer.removeAllListeners(channel);
    },
});
