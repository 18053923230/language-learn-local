import Dexie, { Table } from "dexie";
import { SubtitleVersion } from "@/types/subtitle-version";
import { Subtitle } from "@/types/subtitle";

class SubtitleVersionDatabase extends Dexie {
  subtitleVersions!: Table<SubtitleVersion>;

  constructor() {
    super("SubtitleVersionDB");
    this.version(1).stores({
      subtitleVersions: "id, videoId, versionType, isDefault, createdAt",
    });
  }
}

export class SubtitleVersionStorage {
  private db: SubtitleVersionDatabase;

  constructor() {
    this.db = new SubtitleVersionDatabase();
  }

  /**
   * 保存字幕版本
   */
  async saveVersion(version: SubtitleVersion): Promise<void> {
    try {
      // 如果是默认版本，先取消其他默认版本
      if (version.isDefault) {
        await this.db.subtitleVersions
          .where("videoId")
          .equals(version.videoId)
          .modify({ isDefault: false });
      }

      await this.db.subtitleVersions.put({
        ...version,
        createdAt: new Date(version.createdAt),
        updatedAt: new Date(),
      });

      console.log(`Subtitle version saved: ${version.id}`);
    } catch (error) {
      console.error("Error saving subtitle version:", error);
      throw error;
    }
  }

  /**
   * 从原始数据创建原始字幕版本
   */
  async createRawVersionFromData(
    videoId: string,
    rawData: any,
    subtitles: Subtitle[]
  ): Promise<SubtitleVersion> {
    const version: SubtitleVersion = {
      id: `raw-${videoId}-${Date.now()}`,
      videoId,
      versionName: "原始字幕",
      versionType: "raw",
      subtitles,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: "AssemblyAI 原始转录数据生成的字幕",
      confidence: rawData.metadata?.averageConfidence || 0,
      source: "assemblyai",
      isDefault: true,
      metadata: {
        totalSegments: subtitles.length,
        totalDuration: Math.max(...subtitles.map((s) => s.end)),
        averageSegmentLength:
          subtitles.length > 0
            ? subtitles.reduce((sum, s) => sum + s.text.length, 0) /
              subtitles.length
            : 0,
      },
    };

    await this.saveVersion(version);
    return version;
  }

  /**
   * 创建自定义字幕版本
   */
  async createCustomVersion(
    videoId: string,
    subtitles: Subtitle[],
    versionName: string,
    description?: string
  ): Promise<SubtitleVersion> {
    const version: SubtitleVersion = {
      id: `custom-${videoId}-${Date.now()}`,
      videoId,
      versionName,
      versionType: "custom",
      subtitles,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: description || "用户自定义字幕",
      confidence:
        subtitles.length > 0
          ? subtitles.reduce((sum, s) => sum + s.confidence, 0) /
            subtitles.length
          : 0,
      source: "manual",
      isDefault: false,
      metadata: {
        totalSegments: subtitles.length,
        totalDuration: Math.max(...subtitles.map((s) => s.end)),
        averageSegmentLength:
          subtitles.length > 0
            ? subtitles.reduce((sum, s) => sum + s.text.length, 0) /
              subtitles.length
            : 0,
      },
    };

    await this.saveVersion(version);
    return version;
  }

  /**
   * 创建优化字幕版本
   */
  async createOptimizedVersion(
    videoId: string,
    subtitles: Subtitle[],
    optimizationParams: any,
    versionName: string = "优化字幕"
  ): Promise<SubtitleVersion> {
    const version: SubtitleVersion = {
      id: `optimized-${videoId}-${Date.now()}`,
      videoId,
      versionName,
      versionType: "optimized",
      subtitles,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: "基于原始数据优化的字幕",
      confidence:
        subtitles.length > 0
          ? subtitles.reduce((sum, s) => sum + s.confidence, 0) /
            subtitles.length
          : 0,
      source: "optimized",
      isDefault: false,
      metadata: {
        totalSegments: subtitles.length,
        totalDuration: Math.max(...subtitles.map((s) => s.end)),
        averageSegmentLength:
          subtitles.length > 0
            ? subtitles.reduce((sum, s) => sum + s.text.length, 0) /
              subtitles.length
            : 0,
        optimizationParams,
      },
    };

    await this.saveVersion(version);
    return version;
  }

  /**
   * 获取视频的所有字幕版本
   */
  async getVersionsByVideoId(videoId: string): Promise<SubtitleVersion[]> {
    try {
      const versions = await this.db.subtitleVersions
        .where("videoId")
        .equals(videoId)
        .toArray();

      return versions.map((version) => ({
        ...version,
        createdAt: new Date(version.createdAt),
        updatedAt: new Date(version.updatedAt),
      }));
    } catch (error) {
      console.error("Error getting subtitle versions:", error);
      return [];
    }
  }

  /**
   * 获取默认字幕版本
   */
  async getDefaultVersion(videoId: string): Promise<SubtitleVersion | null> {
    try {
      const version = await this.db.subtitleVersions
        .where("videoId")
        .equals(videoId)
        .and((version) => version.isDefault === true)
        .first();

      if (!version) return null;

      return {
        ...version,
        createdAt: new Date(version.createdAt),
        updatedAt: new Date(version.updatedAt),
      };
    } catch (error) {
      console.error("Error getting default version:", error);
      return null;
    }
  }

  /**
   * 设置默认版本
   */
  async setDefaultVersion(versionId: string): Promise<void> {
    try {
      const version = await this.db.subtitleVersions.get(versionId);
      if (!version) throw new Error("Version not found");

      // 取消其他默认版本
      await this.db.subtitleVersions
        .where("videoId")
        .equals(version.videoId)
        .modify({ isDefault: false });

      // 设置新的默认版本
      await this.db.subtitleVersions.update(versionId, {
        isDefault: true,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error setting default version:", error);
      throw error;
    }
  }

  /**
   * 删除字幕版本
   */
  async deleteVersion(versionId: string): Promise<void> {
    try {
      await this.db.subtitleVersions.delete(versionId);
      console.log(`Subtitle version deleted: ${versionId}`);
    } catch (error) {
      console.error("Error deleting subtitle version:", error);
      throw error;
    }
  }

  /**
   * 更新字幕版本
   */
  async updateVersion(
    versionId: string,
    updates: Partial<SubtitleVersion>
  ): Promise<void> {
    try {
      await this.db.subtitleVersions.update(versionId, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating subtitle version:", error);
      throw error;
    }
  }

  /**
   * 检查视频是否有字幕版本
   */
  async hasVersions(videoId: string): Promise<boolean> {
    try {
      const count = await this.db.subtitleVersions
        .where("videoId")
        .equals(videoId)
        .count();
      return count > 0;
    } catch (error) {
      console.error("Error checking subtitle versions:", error);
      return false;
    }
  }

  /**
   * 获取存储统计信息
   */
  async getStorageStats(): Promise<{
    totalVersions: number;
    totalVideos: number;
    versionTypes: { [key: string]: number };
  }> {
    try {
      const allVersions = await this.db.subtitleVersions.toArray();
      const totalVersions = allVersions.length;

      const videoIds = new Set(allVersions.map((v) => v.videoId));
      const totalVideos = videoIds.size;

      const versionTypes = allVersions.reduce((acc, version) => {
        acc[version.versionType] = (acc[version.versionType] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      return {
        totalVersions,
        totalVideos,
        versionTypes,
      };
    } catch (error) {
      console.error("Error getting storage stats:", error);
      return {
        totalVersions: 0,
        totalVideos: 0,
        versionTypes: {},
      };
    }
  }
}

// 导出单例实例
export const subtitleVersionStorage = new SubtitleVersionStorage();
