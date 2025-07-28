import { app } from "electron";
import * as path from "path";
import * as fs from "fs";
import { dialog } from "electron";

export class FileManager {
  private videosDir: string;

  constructor() {
    this.videosDir = path.join(app.getPath("userData"), "videos");
    this.ensureVideosDirectory();
  }

  private ensureVideosDirectory(): void {
    if (!fs.existsSync(this.videosDir)) {
      fs.mkdirSync(this.videosDir, { recursive: true });
    }
  }

  // 保存视频文件
  async saveVideo(videoData: Buffer, filename: string): Promise<string> {
    const filePath = path.join(this.videosDir, filename);

    try {
      fs.writeFileSync(filePath, videoData);
      console.log(`Video saved to: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error("Failed to save video:", error);
      throw new Error(`Failed to save video: ${error}`);
    }
  }

  // 选择保存位置
  async saveVideoAs(
    videoData: Buffer,
    defaultFilename: string
  ): Promise<string> {
    const result = await dialog.showSaveDialog({
      title: "Save Generated Video",
      defaultPath: defaultFilename,
      filters: [
        { name: "Video Files", extensions: ["mp4", "webm", "avi"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (result.canceled) {
      throw new Error("Save operation cancelled");
    }

    const filePath = result.filePath!;

    try {
      fs.writeFileSync(filePath, videoData);
      console.log(`Video saved to: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error("Failed to save video:", error);
      throw new Error(`Failed to save video: ${error}`);
    }
  }

  // 获取视频文件列表
  async getVideoFiles(): Promise<
    Array<{ name: string; path: string; size: number; modified: Date }>
  > {
    try {
      const files = fs.readdirSync(this.videosDir);
      const videoFiles = [];

      for (const file of files) {
        const filePath = path.join(this.videosDir, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile() && this.isVideoFile(file)) {
          videoFiles.push({
            name: file,
            path: filePath,
            size: stats.size,
            modified: stats.mtime,
          });
        }
      }

      return videoFiles.sort(
        (a, b) => b.modified.getTime() - a.modified.getTime()
      );
    } catch (error) {
      console.error("Failed to get video files:", error);
      return [];
    }
  }

  // 删除视频文件
  async deleteVideo(filename: string): Promise<void> {
    const filePath = path.join(this.videosDir, filename);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Video deleted: ${filePath}`);
      }
    } catch (error) {
      console.error("Failed to delete video:", error);
      throw new Error(`Failed to delete video: ${error}`);
    }
  }

  // 获取存储统计
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    availableSpace: number;
  }> {
    try {
      const files = await this.getVideoFiles();
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);

      // 获取可用空间
      const availableSpace = this.getAvailableSpace(this.videosDir);

      return {
        totalFiles: files.length,
        totalSize,
        availableSpace,
      };
    } catch (error) {
      console.error("Failed to get storage stats:", error);
      return {
        totalFiles: 0,
        totalSize: 0,
        availableSpace: 0,
      };
    }
  }

  // 清理旧文件
  async cleanupOldFiles(daysToKeep: number = 30): Promise<number> {
    try {
      const files = await this.getVideoFiles();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      let deletedCount = 0;
      for (const file of files) {
        if (file.modified < cutoffDate) {
          await this.deleteVideo(file.name);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error("Failed to cleanup old files:", error);
      return 0;
    }
  }

  // 检查是否为视频文件
  private isVideoFile(filename: string): boolean {
    const videoExtensions = [
      ".mp4",
      ".webm",
      ".avi",
      ".mov",
      ".mkv",
      ".flv",
      ".wmv",
    ];
    const ext = path.extname(filename).toLowerCase();
    return videoExtensions.includes(ext);
  }

  // 获取可用空间
  private getAvailableSpace(dirPath: string): number {
    try {
      // 在 Windows 上，我们可以使用 PowerShell 命令获取磁盘空间
      const { execSync } = require("child_process");
      const drive = path.parse(dirPath).root;
      const command = `powershell -Command "(Get-WmiObject -Class Win32_LogicalDisk -Filter 'DeviceID=\\'${drive.replace(
        ":",
        ""
      )}\\'').FreeSpace"`;
      const result = execSync(command, { encoding: "utf8" });
      return parseInt(result.trim());
    } catch (error) {
      console.error("Failed to get available space:", error);
      return 0;
    }
  }

  // 打开文件所在位置
  async openFileLocation(filePath: string): Promise<void> {
    try {
      const { shell } = require("electron");
      shell.showItemInFolder(filePath);
    } catch (error) {
      console.error("Failed to open file location:", error);
    }
  }

  // 打开视频文件
  async openVideoFile(filePath: string): Promise<void> {
    try {
      const { shell } = require("electron");
      shell.openPath(filePath);
    } catch (error) {
      console.error("Failed to open video file:", error);
    }
  }
}
