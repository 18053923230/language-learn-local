"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIpcHandlers = setupIpcHandlers;
const electron_1 = require("electron");
const ffmpeg_service_1 = require("./ffmpeg-service");
const video_processor_1 = require("./video-processor");
const database_service_1 = require("./database-service");
const file_manager_1 = require("./file-manager");
function setupIpcHandlers(mainWindow) {
    const ffmpegService = new ffmpeg_service_1.FFmpegService();
    const videoProcessor = new video_processor_1.VideoProcessor(ffmpegService);
    const databaseService = new database_service_1.DatabaseService();
    const fileManager = new file_manager_1.FileManager();
    // 初始化数据库
    databaseService.initialize();
    // 视频处理请求
    electron_1.ipcMain.handle("video:process-segments", async (event, segments, options) => {
        try {
            const result = await videoProcessor.processVideoSegments(segments, options);
            return result;
        }
        catch (error) {
            console.error("Video processing error:", error);
            throw error;
        }
    });
    // 硬件信息获取
    electron_1.ipcMain.handle("system:get-hardware-info", async () => {
        try {
            return await ffmpegService.detectHardwareAcceleration();
        }
        catch (error) {
            console.error("Hardware detection error:", error);
            throw error;
        }
    });
    // 文件保存
    electron_1.ipcMain.handle("file:save-video", async (event, videoData, filename) => {
        try {
            return await fileManager.saveVideo(videoData, filename);
        }
        catch (error) {
            console.error("File save error:", error);
            throw error;
        }
    });
    // 数据库操作
    electron_1.ipcMain.handle("database:save-subtitle-record", async (event, record) => {
        try {
            return await databaseService.saveSubtitleRecord(record);
        }
        catch (error) {
            console.error("Database save error:", error);
            throw error;
        }
    });
    electron_1.ipcMain.handle("database:get-subtitle-records", async () => {
        try {
            return await databaseService.getSubtitleRecords();
        }
        catch (error) {
            console.error("Database get error:", error);
            throw error;
        }
    });
    // 进度通知
    electron_1.ipcMain.handle("progress:notify", (event, progress) => {
        if (mainWindow) {
            mainWindow.webContents.send("progress:update", progress);
        }
    });
    // 错误通知
    electron_1.ipcMain.handle("error:notify", (event, error) => {
        if (mainWindow) {
            mainWindow.webContents.send("error:update", error);
        }
    });
}
