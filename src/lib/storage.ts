import Dexie, { Table } from "dexie";
import { Video } from "@/types/video";
import { Subtitle } from "@/types/subtitle";
import { VocabularyItem } from "@/types/vocabulary";

// 播放历史记录接口
export interface PlayHistory {
  id?: number;
  videoId: string;
  videoName: string;
  currentTime: number;
  duration: number;
  lastPlayed: Date;
  playCount: number;
}

// 视频缓存接口
export interface VideoCache {
  id?: number;
  videoId: string;
  videoName: string;
  url: string;
  size: number;
  format: string;
  language: string;
  cachedAt: Date;
  lastAccessed: Date;
}

// 用户设置接口
export interface UserSettings {
  id?: number;
  key: string;
  value: string;
  updatedAt: Date;
}

// 数据库类
export class LanguageLearningDB extends Dexie {
  videos!: Table<Video>;
  subtitles!: Table<Subtitle>;
  vocabulary!: Table<VocabularyItem>;
  playHistory!: Table<PlayHistory>;
  videoCache!: Table<VideoCache>;
  settings!: Table<UserSettings>;

  constructor() {
    super("LanguageLearningDB");

    this.version(1).stores({
      videos: "id, name, language, uploadedAt",
      subtitles: "id, videoId, start, end",
      vocabulary: "id, word, videoId, createdAt",
      playHistory: "++id, videoId, lastPlayed",
      videoCache: "++id, videoId, cachedAt",
      settings: "++id, key",
    });
  }
}

// 数据库实例
export const db = new LanguageLearningDB();

// 存储管理类
export class StorageManager {
  // 视频相关
  static async saveVideo(video: Video): Promise<void> {
    await db.videos.put(video);
  }

  static async getVideo(id: string): Promise<Video | undefined> {
    return await db.videos.get(id);
  }

  static async getAllVideos(): Promise<Video[]> {
    return await db.videos.toArray();
  }

  static async deleteVideo(id: string): Promise<void> {
    await db.videos.delete(id);
    // 同时删除相关的字幕和播放历史
    await db.subtitles.where("videoId").equals(id).delete();
    await db.playHistory.where("videoId").equals(id).delete();
  }

  // 字幕相关
  static async saveSubtitles(subtitles: Subtitle[]): Promise<void> {
    await db.subtitles.bulkPut(subtitles);
  }

  static async getSubtitles(videoId: string): Promise<Subtitle[]> {
    return await db.subtitles.where("videoId").equals(videoId).toArray();
  }

  static async updateSubtitle(subtitle: Subtitle): Promise<void> {
    await db.subtitles.put(subtitle);
  }

  // 词汇相关
  static async saveVocabularyItem(item: VocabularyItem): Promise<void> {
    await db.vocabulary.put(item);
  }

  static async getAllVocabulary(): Promise<VocabularyItem[]> {
    return await db.vocabulary.toArray();
  }

  static async deleteVocabularyItem(id: string): Promise<void> {
    await db.vocabulary.delete(id);
  }

  static async updateVocabularyItem(
    id: string,
    updates: Partial<VocabularyItem>
  ): Promise<void> {
    const item = await db.vocabulary.get(id);
    if (item) {
      await db.vocabulary.put({ ...item, ...updates });
    }
  }

  // 播放历史相关
  static async savePlayHistory(history: PlayHistory): Promise<void> {
    const existing = await db.playHistory
      .where("videoId")
      .equals(history.videoId)
      .first();
    if (existing) {
      // 更新现有记录
      await db.playHistory.put({
        ...existing,
        currentTime: history.currentTime,
        lastPlayed: history.lastPlayed,
        playCount: existing.playCount + 1,
      });
    } else {
      // 创建新记录
      await db.playHistory.add(history);
    }
  }

  static async getPlayHistory(
    videoId: string
  ): Promise<PlayHistory | undefined> {
    return await db.playHistory.where("videoId").equals(videoId).first();
  }

  static async getAllPlayHistory(): Promise<PlayHistory[]> {
    return await db.playHistory.orderBy("lastPlayed").reverse().toArray();
  }

  static async clearPlayHistory(): Promise<void> {
    await db.playHistory.clear();
  }

  // 视频缓存相关
  static async saveVideoCache(cache: VideoCache): Promise<void> {
    const existing = await db.videoCache
      .where("videoId")
      .equals(cache.videoId)
      .first();
    if (existing) {
      await db.videoCache.put({
        ...existing,
        ...cache,
        lastAccessed: new Date(),
      });
    } else {
      await db.videoCache.add(cache);
    }
  }

  static async getVideoCache(videoId: string): Promise<VideoCache | undefined> {
    return await db.videoCache.where("videoId").equals(videoId).first();
  }

  static async getAllVideoCache(): Promise<VideoCache[]> {
    return await db.videoCache.orderBy("lastAccessed").reverse().toArray();
  }

  static async clearVideoCache(): Promise<void> {
    await db.videoCache.clear();
  }

  // 设置相关
  static async saveSetting(key: string, value: string): Promise<void> {
    const existing = await db.settings.where("key").equals(key).first();
    if (existing) {
      await db.settings.put({ ...existing, value, updatedAt: new Date() });
    } else {
      await db.settings.add({ key, value, updatedAt: new Date() });
    }
  }

  static async getSetting(key: string): Promise<string | undefined> {
    const setting = await db.settings.where("key").equals(key).first();
    return setting?.value;
  }

  static async getAllSettings(): Promise<UserSettings[]> {
    return await db.settings.toArray();
  }

  // 数据导出
  static async exportData(): Promise<{
    videos: Video[];
    subtitles: Subtitle[];
    vocabulary: VocabularyItem[];
    playHistory: PlayHistory[];
    settings: UserSettings[];
  }> {
    return {
      videos: await this.getAllVideos(),
      subtitles: await db.subtitles.toArray(),
      vocabulary: await this.getAllVocabulary(),
      playHistory: await this.getAllPlayHistory(),
      settings: await this.getAllSettings(),
    };
  }

  // 数据导入
  static async importData(data: {
    videos: Video[];
    subtitles: Subtitle[];
    vocabulary: VocabularyItem[];
    playHistory: PlayHistory[];
    settings: UserSettings[];
  }): Promise<void> {
    await db.transaction(
      "rw",
      [db.videos, db.subtitles, db.vocabulary, db.playHistory, db.settings],
      async () => {
        await db.videos.bulkPut(data.videos);
        await db.subtitles.bulkPut(data.subtitles);
        await db.vocabulary.bulkPut(data.vocabulary);
        await db.playHistory.bulkPut(data.playHistory);
        await db.settings.bulkPut(data.settings);
      }
    );
  }

  // 清理过期数据
  static async cleanupOldData(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // 清理过期的播放历史
    await db.playHistory.where("lastPlayed").below(cutoffDate).delete();

    // 清理过期的视频缓存
    await db.videoCache.where("lastAccessed").below(cutoffDate).delete();
  }
}
