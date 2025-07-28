import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { app } from "electron";
import * as path from "path";

export interface SubtitleRecord {
  id: string;
  videoId: string;
  videoName: string;
  videoHash: string;
  language: string;
  subtitles: string; // JSON string
  createdAt: string;
  updatedAt: string;
  fileSize: number;
  duration: number;
  confidence: number;
  source: "assemblyai" | "upload" | "manual";
}

export class DatabaseService {
  private db: any = null;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(app.getPath("userData"), "language-learn.db");
  }

  async initialize(): Promise<void> {
    try {
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database,
      });

      // 创建字幕记录表
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS subtitle_records (
          id TEXT PRIMARY KEY,
          videoId TEXT NOT NULL,
          videoName TEXT NOT NULL,
          videoHash TEXT NOT NULL,
          language TEXT NOT NULL,
          subtitles TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          fileSize INTEGER NOT NULL,
          duration REAL NOT NULL,
          confidence REAL NOT NULL,
          source TEXT NOT NULL
        )
      `);

      // 创建索引
      await this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_video_id ON subtitle_records(videoId);
        CREATE INDEX IF NOT EXISTS idx_video_hash ON subtitle_records(videoHash);
        CREATE INDEX IF NOT EXISTS idx_language ON subtitle_records(language);
        CREATE INDEX IF NOT EXISTS idx_created_at ON subtitle_records(createdAt);
      `);

      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Database initialization failed:", error);
      throw error;
    }
  }

  // 生成视频哈希值（复用现有逻辑）
  private generateVideoHash(video: any): string {
    const hashData = `${video.name}-${video.size}-${video.duration}-${video.language}`;
    const encoded = encodeURIComponent(hashData);
    return Buffer.from(encoded)
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 16);
  }

  // 保存字幕记录
  async saveSubtitleRecord(record: any): Promise<void> {
    if (!this.db) await this.initialize();

    const videoHash = this.generateVideoHash(record.video);
    const averageConfidence =
      record.subtitles.length > 0
        ? record.subtitles.reduce(
            (sum: number, sub: any) => sum + (sub.confidence || 0),
            0
          ) / record.subtitles.length
        : 0;

    const dbRecord: SubtitleRecord = {
      id: `${record.video.id}-${Date.now()}`,
      videoId: record.video.id,
      videoName: record.video.name,
      videoHash,
      language: record.video.language,
      subtitles: JSON.stringify(record.subtitles),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fileSize: record.video.size,
      duration: record.video.duration,
      confidence: averageConfidence,
      source: record.source || "assemblyai",
    };

    await this.db.run(
      `INSERT OR REPLACE INTO subtitle_records VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dbRecord.id,
        dbRecord.videoId,
        dbRecord.videoName,
        dbRecord.videoHash,
        dbRecord.language,
        dbRecord.subtitles,
        dbRecord.createdAt,
        dbRecord.updatedAt,
        dbRecord.fileSize,
        dbRecord.duration,
        dbRecord.confidence,
        dbRecord.source,
      ]
    );
  }

  // 根据视频ID获取字幕记录
  async getSubtitleRecordByVideoId(
    videoId: string
  ): Promise<SubtitleRecord | null> {
    if (!this.db) await this.initialize();

    const row = await this.db.get(
      "SELECT * FROM subtitle_records WHERE videoId = ? ORDER BY createdAt DESC LIMIT 1",
      [videoId]
    );

    return row || null;
  }

  // 根据视频哈希获取字幕记录
  async getSubtitleRecordByVideoHash(
    videoHash: string
  ): Promise<SubtitleRecord | null> {
    if (!this.db) await this.initialize();

    const row = await this.db.get(
      "SELECT * FROM subtitle_records WHERE videoHash = ? ORDER BY createdAt DESC LIMIT 1",
      [videoHash]
    );

    return row || null;
  }

  // 获取所有字幕记录
  async getSubtitleRecords(): Promise<SubtitleRecord[]> {
    if (!this.db) await this.initialize();

    const rows = await this.db.all(
      "SELECT * FROM subtitle_records ORDER BY createdAt DESC"
    );

    return rows.map((row: SubtitleRecord) => ({
      ...row,
      subtitles: JSON.parse(row.subtitles),
    }));
  }

  // 更新视频ID
  async updateVideoId(recordId: string, newVideoId: string): Promise<void> {
    if (!this.db) await this.initialize();

    await this.db.run(
      "UPDATE subtitle_records SET videoId = ?, updatedAt = ? WHERE id = ?",
      [newVideoId, new Date().toISOString(), recordId]
    );
  }

  // 检查是否有字幕记录
  async hasSubtitleRecord(video: any): Promise<boolean> {
    if (!this.db) await this.initialize();

    const videoHash = this.generateVideoHash(video);
    const row = await this.db.get(
      "SELECT id FROM subtitle_records WHERE videoHash = ? LIMIT 1",
      [videoHash]
    );

    return !!row;
  }

  // 检查是否有相似视频记录
  async hasSimilarVideoRecord(video: any): Promise<SubtitleRecord | null> {
    if (!this.db) await this.initialize();

    const videoHash = this.generateVideoHash(video);
    return await this.getSubtitleRecordByVideoHash(videoHash);
  }

  // 删除字幕记录
  async deleteSubtitleRecord(id: string): Promise<void> {
    if (!this.db) await this.initialize();

    await this.db.run("DELETE FROM subtitle_records WHERE id = ?", [id]);
  }

  // 更新字幕记录
  async updateSubtitleRecord(id: string, subtitles: any[]): Promise<void> {
    if (!this.db) await this.initialize();

    const averageConfidence =
      subtitles.length > 0
        ? subtitles.reduce((sum, sub) => sum + (sub.confidence || 0), 0) /
          subtitles.length
        : 0;

    await this.db.run(
      `UPDATE subtitle_records 
       SET subtitles = ?, confidence = ?, updatedAt = ? 
       WHERE id = ?`,
      [
        JSON.stringify(subtitles),
        averageConfidence,
        new Date().toISOString(),
        id,
      ]
    );
  }

  // 获取存储统计
  async getStorageStats(): Promise<{
    totalRecords: number;
    totalSize: number;
    languages: string[];
    sources: { [key: string]: number };
  }> {
    if (!this.db) await this.initialize();

    const totalRecords = await this.db.get(
      "SELECT COUNT(*) as count FROM subtitle_records"
    );
    const totalSize = await this.db.get(
      "SELECT SUM(fileSize) as total FROM subtitle_records"
    );
    const languages = await this.db.all(
      "SELECT DISTINCT language FROM subtitle_records"
    );
    const sources = await this.db.all(
      "SELECT source, COUNT(*) as count FROM subtitle_records GROUP BY source"
    );

    return {
      totalRecords: totalRecords.count,
      totalSize: totalSize.total || 0,
      languages: languages.map((row: any) => row.language),
      sources: sources.reduce((acc: any, row: any) => {
        acc[row.source] = row.count;
        return acc;
      }, {}),
    };
  }

  // 清理旧记录
  async cleanupOldRecords(daysToKeep: number = 30): Promise<number> {
    if (!this.db) await this.initialize();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.db.run(
      "DELETE FROM subtitle_records WHERE createdAt < ?",
      [cutoffDate.toISOString()]
    );

    return result.changes;
  }

  // 关闭数据库连接
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}
