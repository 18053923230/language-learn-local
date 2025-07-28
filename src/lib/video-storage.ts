import Dexie, { Table } from "dexie";

// 视频文件记录接口
export interface VideoFileRecord {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  path: string; // 项目目录中的相对路径
  uploadedAt: Date;
  lastAccessed: Date;
  metadata?: {
    duration?: number;
    resolution?: string;
    bitrate?: number;
  };
}

// 视频存储数据库
class VideoStorageDB extends Dexie {
  videoFiles!: Table<VideoFileRecord>;

  constructor() {
    super("VideoStorageDB");
    this.version(1).stores({
      videoFiles: "id, name, originalName, path, uploadedAt",
    });
  }
}

const videoStorageDB = new VideoStorageDB();

export class VideoStorageService {
  private static instance: VideoStorageService;
  private projectVideoDir = "videos"; // 项目目录下的视频文件夹

  private constructor() {
    this.ensureVideoDirectory();
  }

  static getInstance(): VideoStorageService {
    if (!VideoStorageService.instance) {
      VideoStorageService.instance = new VideoStorageService();
    }
    return VideoStorageService.instance;
  }

  /**
   * 确保视频目录存在
   */
  private async ensureVideoDirectory(): Promise<void> {
    try {
      // 在浏览器环境中，我们使用 IndexedDB 存储文件数据
      // 在实际部署中，这里会创建服务器端目录
      console.log("Video directory ensured");
    } catch (error) {
      console.error("Error ensuring video directory:", error);
    }
  }

  /**
   * 保存视频文件到项目目录
   */
  async saveVideoFile(
    file: File,
    videoId: string,
    metadata?: {
      duration?: number;
      resolution?: string;
      bitrate?: number;
    }
  ): Promise<VideoFileRecord> {
    try {
      // 生成唯一的文件名
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const fileName = `${videoId}_${timestamp}.${fileExtension}`;
      const relativePath = `${this.projectVideoDir}/${fileName}`;

      // 创建视频文件记录
      const videoRecord: VideoFileRecord = {
        id: videoId,
        name: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        path: relativePath,
        uploadedAt: new Date(),
        lastAccessed: new Date(),
        metadata,
      };

      // 保存到 IndexedDB
      await videoStorageDB.videoFiles.put(videoRecord);

      // 将文件数据存储到 IndexedDB 的另一个表中
      await this.storeFileData(videoId, file);

      console.log(`Video file saved: ${relativePath}`);
      return videoRecord;
    } catch (error) {
      console.error("Error saving video file:", error);
      throw new Error("Failed to save video file");
    }
  }

  /**
   * 存储文件数据到 IndexedDB
   */
  private async storeFileData(videoId: string, file: File): Promise<void> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // 使用 IndexedDB 存储文件数据
      const db = await this.openFileDB();
      const transaction = db.transaction(["videoData"], "readwrite");
      const store = transaction.objectStore("videoData");

      await store.put({
        id: videoId,
        data: uint8Array,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error storing file data:", error);
      throw new Error("Failed to store file data");
    }
  }

  /**
   * 打开文件数据数据库
   */
  private async openFileDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("VideoFileDataDB", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("videoData")) {
          db.createObjectStore("videoData", { keyPath: "id" });
        }
      };
    });
  }

  /**
   * 获取视频文件
   */
  async getVideoFile(videoId: string): Promise<File | null> {
    try {
      // 获取文件记录
      const record = await videoStorageDB.videoFiles.get(videoId);
      if (!record) {
        console.warn(`Video file record not found: ${videoId}`);
        return null;
      }

      // 更新最后访问时间
      await videoStorageDB.videoFiles.update(videoId, {
        lastAccessed: new Date(),
      });

      // 从 IndexedDB 获取文件数据
      const fileData = await this.getFileData(videoId);
      if (!fileData) {
        console.warn(`Video file data not found: ${videoId}`);
        return null;
      }

      // 创建 File 对象
      const file = new File([fileData], record.originalName, {
        type: record.type,
        lastModified: record.uploadedAt.getTime(),
      });

      return file;
    } catch (error) {
      console.error("Error getting video file:", error);
      return null;
    }
  }

  /**
   * 从 IndexedDB 获取文件数据
   */
  private async getFileData(videoId: string): Promise<Uint8Array | null> {
    try {
      const db = await this.openFileDB();
      const transaction = db.transaction(["videoData"], "readonly");
      const store = transaction.objectStore("videoData");

      const result = await store.get(videoId);
      return result ? result.data : null;
    } catch (error) {
      console.error("Error getting file data:", error);
      return null;
    }
  }

  /**
   * 获取所有视频文件记录
   */
  async getAllVideoFiles(): Promise<VideoFileRecord[]> {
    try {
      return await videoStorageDB.videoFiles.toArray();
    } catch (error) {
      console.error("Error getting all video files:", error);
      return [];
    }
  }

  /**
   * 删除视频文件
   */
  async deleteVideoFile(videoId: string): Promise<boolean> {
    try {
      // 删除文件记录
      await videoStorageDB.videoFiles.delete(videoId);

      // 删除文件数据
      const db = await this.openFileDB();
      const transaction = db.transaction(["videoData"], "readwrite");
      const store = transaction.objectStore("videoData");
      await store.delete(videoId);

      console.log(`Video file deleted: ${videoId}`);
      return true;
    } catch (error) {
      console.error("Error deleting video file:", error);
      return false;
    }
  }

  /**
   * 获取视频文件统计信息
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    averageFileSize: number;
    oldestFile: Date | null;
    newestFile: Date | null;
  }> {
    try {
      const allFiles = await this.getAllVideoFiles();

      if (allFiles.length === 0) {
        return {
          totalFiles: 0,
          totalSize: 0,
          averageFileSize: 0,
          oldestFile: null,
          newestFile: null,
        };
      }

      const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);
      const averageFileSize = totalSize / allFiles.length;
      const oldestFile = new Date(
        Math.min(...allFiles.map((f) => f.uploadedAt.getTime()))
      );
      const newestFile = new Date(
        Math.max(...allFiles.map((f) => f.uploadedAt.getTime()))
      );

      return {
        totalFiles: allFiles.length,
        totalSize,
        averageFileSize,
        oldestFile,
        newestFile,
      };
    } catch (error) {
      console.error("Error getting storage stats:", error);
      return {
        totalFiles: 0,
        totalSize: 0,
        averageFileSize: 0,
        oldestFile: null,
        newestFile: null,
      };
    }
  }

  /**
   * 清理过期的视频文件
   */
  async cleanupOldFiles(maxAgeDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

      const oldFiles = await videoStorageDB.videoFiles
        .where("lastAccessed")
        .below(cutoffDate)
        .toArray();

      let deletedCount = 0;
      for (const file of oldFiles) {
        if (await this.deleteVideoFile(file.id)) {
          deletedCount++;
        }
      }

      console.log(`Cleaned up ${deletedCount} old video files`);
      return deletedCount;
    } catch (error) {
      console.error("Error cleaning up old files:", error);
      return 0;
    }
  }
}

// 导出单例实例
export const videoStorageService = VideoStorageService.getInstance();
