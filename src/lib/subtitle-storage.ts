import { Subtitle } from "@/types/subtitle";
import { Video } from "@/types/video";

export interface SubtitleRecord {
  id: string;
  videoId: string;
  videoName: string;
  videoHash: string; // 用于识别相同视频
  language: string;
  subtitles: Subtitle[];
  createdAt: Date;
  updatedAt: Date;
  fileSize: number;
  duration: number;
  confidence: number; // 平均置信度
  source: "assemblyai" | "upload" | "manual";
}

class SubtitleStorageService {
  private dbName = "language-learn-subtitles";
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建字幕记录表
        if (!db.objectStoreNames.contains("subtitleRecords")) {
          const store = db.createObjectStore("subtitleRecords", {
            keyPath: "id",
          });
          store.createIndex("videoId", "videoId", { unique: false });
          store.createIndex("videoHash", "videoHash", { unique: false });
          store.createIndex("language", "language", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };
    });
  }

  // 生成视频哈希值（基于文件名、大小、时长等）
  private generateVideoHash(video: Video): string {
    const hashData = `${video.name}-${video.size}-${video.duration}-${video.language}`;
    // 使用 encodeURIComponent 处理非 Latin1 字符，然后进行 Base64 编码
    const encoded = encodeURIComponent(hashData);
    return btoa(encoded)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 16);
  }

  // 保存字幕记录
  async saveSubtitleRecord(
    video: Video,
    subtitles: Subtitle[],
    source: "assemblyai" | "upload" | "manual" = "assemblyai"
  ): Promise<string> {
    if (!this.db) await this.init();

    const videoHash = this.generateVideoHash(video);
    const averageConfidence =
      subtitles.length > 0
        ? subtitles.reduce((sum, sub) => sum + (sub.confidence || 0), 0) /
          subtitles.length
        : 0;

    const record: SubtitleRecord = {
      id: `${video.id}-${Date.now()}`,
      videoId: video.id,
      videoName: video.name,
      videoHash,
      language: video.language,
      subtitles,
      createdAt: new Date(),
      updatedAt: new Date(),
      fileSize: video.size,
      duration: video.duration,
      confidence: averageConfidence,
      source,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ["subtitleRecords"],
        "readwrite"
      );
      const store = transaction.objectStore("subtitleRecords");
      const request = store.put(record);

      request.onsuccess = () => resolve(record.id);
      request.onerror = () => reject(request.error);
    });
  }

  // 根据视频ID查找字幕记录
  async getSubtitleRecordByVideoId(
    videoId: string
  ): Promise<SubtitleRecord | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["subtitleRecords"], "readonly");
      const store = transaction.objectStore("subtitleRecords");
      const index = store.index("videoId");
      const request = index.get(videoId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // 根据视频哈希查找字幕记录（用于识别相同视频）
  async getSubtitleRecordByVideoHash(
    videoHash: string
  ): Promise<SubtitleRecord | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["subtitleRecords"], "readonly");
      const store = transaction.objectStore("subtitleRecords");
      const index = store.index("videoHash");
      const request = index.get(videoHash);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // 更新视频ID（当使用相似视频的字幕时）
  async updateVideoId(recordId: string, newVideoId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ["subtitleRecords"],
        "readwrite"
      );
      const store = transaction.objectStore("subtitleRecords");

      // 先获取现有记录
      const getRequest = store.get(recordId);
      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          record.videoId = newVideoId;
          record.updatedAt = new Date();

          const putRequest = store.put(record);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error("Subtitle record not found"));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // 检查视频是否已有字幕记录
  async hasSubtitleRecord(video: Video): Promise<boolean> {
    const record = await this.getSubtitleRecordByVideoId(video.id);
    return !!record;
  }

  // 检查是否有相同视频的字幕记录
  async hasSimilarVideoRecord(video: Video): Promise<SubtitleRecord | null> {
    const videoHash = this.generateVideoHash(video);
    return await this.getSubtitleRecordByVideoHash(videoHash);
  }

  // 获取所有字幕记录
  async getAllSubtitleRecords(): Promise<SubtitleRecord[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["subtitleRecords"], "readonly");
      const store = transaction.objectStore("subtitleRecords");
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // 删除字幕记录
  async deleteSubtitleRecord(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ["subtitleRecords"],
        "readwrite"
      );
      const store = transaction.objectStore("subtitleRecords");
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 更新字幕记录
  async updateSubtitleRecord(id: string, subtitles: Subtitle[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ["subtitleRecords"],
        "readwrite"
      );
      const store = transaction.objectStore("subtitleRecords");

      // 先获取现有记录
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          record.subtitles = subtitles;
          record.updatedAt = new Date();
          record.confidence =
            subtitles.length > 0
              ? subtitles.reduce((sum, sub) => sum + (sub.confidence || 0), 0) /
                subtitles.length
              : 0;

          const putRequest = store.put(record);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error("Subtitle record not found"));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // 获取存储统计信息
  async getStorageStats(): Promise<{
    totalRecords: number;
    totalSize: number;
    languages: string[];
    sources: { [key: string]: number };
  }> {
    const records = await this.getAllSubtitleRecords();
    const languages = [...new Set(records.map((r) => r.language))];
    const sources = records.reduce((acc, record) => {
      acc[record.source] = (acc[record.source] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalRecords: records.length,
      totalSize: records.reduce((sum, record) => sum + record.fileSize, 0),
      languages,
      sources,
    };
  }

  // 清理旧记录
  async cleanupOldRecords(daysToKeep: number = 30): Promise<number> {
    const records = await this.getAllSubtitleRecords();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const oldRecords = records.filter(
      (record) => new Date(record.createdAt) < cutoffDate
    );

    let deletedCount = 0;
    for (const record of oldRecords) {
      await this.deleteSubtitleRecord(record.id);
      deletedCount++;
    }

    return deletedCount;
  }
}

export const subtitleStorage = new SubtitleStorageService();
