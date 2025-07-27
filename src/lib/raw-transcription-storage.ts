import Dexie, { Table } from "dexie";
import { RawTranscriptionData } from "@/types/raw-transcription";

class RawTranscriptionDatabase extends Dexie {
  rawTranscriptions!: Table<RawTranscriptionData>;

  constructor() {
    super("RawTranscriptionDB");
    this.version(1).stores({
      rawTranscriptions: "id, videoId, createdAt",
    });
  }
}

export class RawTranscriptionStorage {
  private db: RawTranscriptionDatabase;

  constructor() {
    this.db = new RawTranscriptionDatabase();
  }

  /**
   * 保存原始转录数据 - 只允许保存一次，不允许修改
   */
  async saveRawData(data: RawTranscriptionData): Promise<void> {
    try {
      // 检查是否已存在
      const existing = await this.db.rawTranscriptions.get(data.id);
      if (existing) {
        throw new Error(
          "Raw transcription data already exists and cannot be modified"
        );
      }

      // 检查是否已存在相同视频的数据
      const existingByVideo = await this.db.rawTranscriptions
        .where("videoId")
        .equals(data.videoId)
        .first();

      if (existingByVideo) {
        throw new Error(
          "Raw transcription data for this video already exists and cannot be modified"
        );
      }

      // 保存数据
      await this.db.rawTranscriptions.add({
        ...data,
        createdAt: new Date(),
      });

      console.log(`Raw transcription data saved successfully: ${data.id}`);
    } catch (error) {
      console.error("Error saving raw transcription data:", error);
      throw error;
    }
  }

  /**
   * 获取原始转录数据 - 只读
   */
  async getRawData(videoId: string): Promise<RawTranscriptionData | null> {
    try {
      const record = await this.db.rawTranscriptions
        .where("videoId")
        .equals(videoId)
        .first();

      if (!record) {
        return null;
      }

      return {
        ...record,
        createdAt: new Date(record.createdAt),
      };
    } catch (error) {
      console.error("Error getting raw transcription data:", error);
      return null;
    }
  }

  /**
   * 根据ID获取原始转录数据 - 只读
   */
  async getRawDataById(id: string): Promise<RawTranscriptionData | null> {
    try {
      const record = await this.db.rawTranscriptions.get(id);

      if (!record) {
        return null;
      }

      return {
        ...record,
        createdAt: new Date(record.createdAt),
      };
    } catch (error) {
      console.error("Error getting raw transcription data by ID:", error);
      return null;
    }
  }

  /**
   * 获取所有原始转录数据 - 只读
   */
  async getAllRawData(): Promise<RawTranscriptionData[]> {
    try {
      const records = await this.db.rawTranscriptions.toArray();

      return records.map((record) => ({
        ...record,
        createdAt: new Date(record.createdAt),
      }));
    } catch (error) {
      console.error("Error getting all raw transcription data:", error);
      return [];
    }
  }

  /**
   * 检查是否存在原始数据
   */
  async hasRawData(videoId: string): Promise<boolean> {
    try {
      const count = await this.db.rawTranscriptions
        .where("videoId")
        .equals(videoId)
        .count();

      return count > 0;
    } catch (error) {
      console.error("Error checking raw transcription data existence:", error);
      return false;
    }
  }

  /**
   * 获取存储统计信息
   */
  async getStorageStats(): Promise<{
    totalRecords: number;
    totalSize: number;
    averageConfidence: number;
  }> {
    try {
      const allData = await this.getAllRawData();
      const totalRecords = allData.length;
      const totalSize = JSON.stringify(allData).length;
      const averageConfidence =
        allData.length > 0
          ? allData.reduce(
              (sum, data) => sum + data.metadata.averageConfidence,
              0
            ) / allData.length
          : 0;

      return {
        totalRecords,
        totalSize,
        averageConfidence,
      };
    } catch (error) {
      console.error("Error getting storage stats:", error);
      return {
        totalRecords: 0,
        totalSize: 0,
        averageConfidence: 0,
      };
    }
  }

  /**
   * 清理数据库（仅用于开发/测试）
   */
  async clearAll(): Promise<void> {
    try {
      await this.db.rawTranscriptions.clear();
      console.log("All raw transcription data cleared");
    } catch (error) {
      console.error("Error clearing raw transcription data:", error);
      throw error;
    }
  }
}

// 导出单例实例
export const rawTranscriptionStorage = new RawTranscriptionStorage();
