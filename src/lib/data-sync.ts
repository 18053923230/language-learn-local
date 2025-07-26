import { StorageManager } from "./storage";
import { Video } from "@/types/video";
import { Subtitle } from "@/types/subtitle";
import { VocabularyItem } from "@/types/vocabulary";

export interface SyncStatus {
  lastSync: Date | null;
  isSyncing: boolean;
  error: string | null;
  totalItems: number;
  syncedItems: number;
}

export interface BackupData {
  version: string;
  timestamp: Date;
  data: {
    videos: Video[];
    subtitles: Subtitle[];
    vocabulary: VocabularyItem[];
    playHistory: any[];
    settings: any[];
  };
  metadata: {
    totalSize: number;
    itemCount: number;
    checksum: string;
  };
}

export class DataSyncManager {
  private static syncStatus: SyncStatus = {
    lastSync: null,
    isSyncing: false,
    error: null,
    totalItems: 0,
    syncedItems: 0,
  };

  // 获取同步状态
  static getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // 创建完整备份
  static async createBackup(): Promise<BackupData> {
    try {
      const data = await StorageManager.exportData();

      // 计算数据大小和项目数量
      const dataString = JSON.stringify(data);
      const totalSize = new Blob([dataString]).size;
      const itemCount = Object.values(data).reduce(
        (sum, items) => sum + items.length,
        0
      );

      // 生成简单的校验和
      const checksum = await this.generateChecksum(dataString);

      const backup: BackupData = {
        version: "1.0.0",
        timestamp: new Date(),
        data,
        metadata: {
          totalSize,
          itemCount,
          checksum,
        },
      };

      return backup;
    } catch (error) {
      throw new Error(
        `Failed to create backup: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // 从备份恢复数据
  static async restoreFromBackup(backup: BackupData): Promise<void> {
    try {
      // 验证备份数据
      const dataString = JSON.stringify(backup.data);
      const checksum = await this.generateChecksum(dataString);

      if (checksum !== backup.metadata.checksum) {
        throw new Error("Backup data integrity check failed");
      }

      // 恢复数据
      await StorageManager.importData(backup.data);
    } catch (error) {
      throw new Error(
        `Failed to restore backup: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // 导出备份到文件
  static async exportBackupToFile(): Promise<void> {
    try {
      const backup = await this.createBackup();
      const backupString = JSON.stringify(backup, null, 2);
      const blob = new Blob([backupString], { type: "application/json" });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `language-learning-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(
        `Failed to export backup: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // 从文件导入备份
  static async importBackupFromFile(file: File): Promise<void> {
    try {
      const text = await file.text();
      const backup: BackupData = JSON.parse(text);

      // 验证备份格式
      if (!backup.version || !backup.data || !backup.metadata) {
        throw new Error("Invalid backup file format");
      }

      await this.restoreFromBackup(backup);
    } catch (error) {
      throw new Error(
        `Failed to import backup: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // 同步到云端 (模拟实现)
  static async syncToCloud(): Promise<void> {
    this.syncStatus.isSyncing = true;
    this.syncStatus.error = null;
    this.syncStatus.syncedItems = 0;

    try {
      const data = await StorageManager.exportData();
      this.syncStatus.totalItems = Object.values(data).reduce(
        (sum, items) => sum + items.length,
        0
      );

      // 模拟云端同步过程
      for (let i = 0; i < this.syncStatus.totalItems; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50)); // 模拟网络延迟
        this.syncStatus.syncedItems = i + 1;
      }

      this.syncStatus.lastSync = new Date();
    } catch (error) {
      this.syncStatus.error =
        error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      this.syncStatus.isSyncing = false;
    }
  }

  // 从云端同步 (模拟实现)
  static async syncFromCloud(): Promise<void> {
    this.syncStatus.isSyncing = true;
    this.syncStatus.error = null;

    try {
      // 模拟从云端获取数据
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.syncStatus.lastSync = new Date();
    } catch (error) {
      this.syncStatus.error =
        error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      this.syncStatus.isSyncing = false;
    }
  }

  // 清理存储空间
  static async cleanupStorage(): Promise<{
    freedSpace: number;
    deletedItems: number;
  }> {
    try {
      const beforeCleanup = await this.getStorageUsage();

      // 清理30天前的数据
      await StorageManager.cleanupOldData(30);

      // 清理过期的视频缓存
      await this.cleanupExpiredVideoCache();

      const afterCleanup = await this.getStorageUsage();

      return {
        freedSpace: beforeCleanup.usedSpace - afterCleanup.usedSpace,
        deletedItems: beforeCleanup.itemCount - afterCleanup.itemCount,
      };
    } catch (error) {
      throw new Error(
        `Failed to cleanup storage: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // 获取存储使用情况
  static async getStorageUsage(): Promise<{
    usedSpace: number;
    totalSpace: number;
    itemCount: number;
    breakdown: {
      videos: number;
      subtitles: number;
      vocabulary: number;
      playHistory: number;
      settings: number;
    };
  }> {
    try {
      const data = await StorageManager.exportData();
      const dataString = JSON.stringify(data);
      const usedSpace = new Blob([dataString]).size;

      // 获取浏览器存储配额 (如果支持)
      let totalSpace = 0;
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        totalSpace = estimate.quota || 0;
      }

      return {
        usedSpace,
        totalSpace,
        itemCount: Object.values(data).reduce(
          (sum, items) => sum + items.length,
          0
        ),
        breakdown: {
          videos: data.videos.length,
          subtitles: data.subtitles.length,
          vocabulary: data.vocabulary.length,
          playHistory: data.playHistory.length,
          settings: data.settings.length,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to get storage usage: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // 生成简单的校验和
  private static async generateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // 清理过期的视频缓存
  private static async cleanupExpiredVideoCache(): Promise<void> {
    try {
      const cache = await StorageManager.getAllVideoCache();
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      for (const item of cache) {
        if (item.lastAccessed < thirtyDaysAgo) {
          await StorageManager.clearVideoCache();
          break;
        }
      }
    } catch (error) {
      console.warn("Failed to cleanup video cache:", error);
    }
  }

  // 压缩数据
  static async compressData(): Promise<{
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  }> {
    try {
      const data = await StorageManager.exportData();
      const originalString = JSON.stringify(data);
      const originalSize = new Blob([originalString]).size;

      // 使用简单的压缩 (移除不必要的空格和换行)
      const compressedString = JSON.stringify(data);
      const compressedSize = new Blob([compressedString]).size;

      return {
        originalSize,
        compressedSize,
        compressionRatio:
          ((originalSize - compressedSize) / originalSize) * 100,
      };
    } catch (error) {
      throw new Error(
        `Failed to compress data: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
