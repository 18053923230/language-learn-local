import { BrowserWindow, ipcMain } from "electron";
import { FFmpegService } from "./ffmpeg-service";
import { VideoProcessor } from "./video-processor";
import { DatabaseService } from "./database-service";
import { FileManager } from "./file-manager";

export function setupIpcHandlers(mainWindow: BrowserWindow | null) {
  const ffmpegService = new FFmpegService();
  const videoProcessor = new VideoProcessor(ffmpegService);
  const databaseService = new DatabaseService();
  const fileManager = new FileManager();

  // 初始化数据库
  databaseService.initialize();

  // 视频处理请求
  ipcMain.handle("video:process-segments", async (event, segments, options) => {
    try {
      const result = await videoProcessor.processVideoSegments(
        segments,
        options
      );
      return result;
    } catch (error) {
      console.error("Video processing error:", error);
      throw error;
    }
  });

  // 硬件信息获取
  ipcMain.handle("system:get-hardware-info", async () => {
    try {
      return await ffmpegService.detectHardwareAcceleration();
    } catch (error) {
      console.error("Hardware detection error:", error);
      throw error;
    }
  });

  // 文件保存
  ipcMain.handle("file:save-video", async (event, videoData, filename) => {
    try {
      return await fileManager.saveVideo(videoData, filename);
    } catch (error) {
      console.error("File save error:", error);
      throw error;
    }
  });

  // 数据库操作
  ipcMain.handle("database:save-subtitle-record", async (event, record) => {
    try {
      return await databaseService.saveSubtitleRecord(record);
    } catch (error) {
      console.error("Database save error:", error);
      throw error;
    }
  });

  ipcMain.handle("database:get-subtitle-records", async () => {
    try {
      return await databaseService.getSubtitleRecords();
    } catch (error) {
      console.error("Database get error:", error);
      throw error;
    }
  });

  // 进度通知
  ipcMain.handle("progress:notify", (event, progress) => {
    if (mainWindow) {
      mainWindow.webContents.send("progress:update", progress);
    }
  });

  // 错误通知
  ipcMain.handle("error:notify", (event, error) => {
    if (mainWindow) {
      mainWindow.webContents.send("error:update", error);
    }
  });
}
