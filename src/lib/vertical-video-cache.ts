import { RawTranscriptionData } from "../types/raw-transcription";
import { Subtitle } from "../types/subtitle";

export interface CachedVideoData {
  videoId: string;
  audioBlob: Blob;
  rawTranscriptionData: RawTranscriptionData;
  subtitles: Subtitle[];
  timestamp: number;
  fileSize: number;
}

export class VerticalVideoCache {
  private static readonly CACHE_PREFIX = "vertical_video_cache_";
  private static readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
  private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时

  /**
   * 生成视频ID（基于文件名和大小）
   */
  static generateVideoId(file: File): string {
    const hash = `${file.name}_${file.size}_${file.lastModified}`;
    return btoa(hash).replace(/[^a-zA-Z0-9]/g, "");
  }

  /**
   * 获取缓存键
   */
  private static getCacheKey(videoId: string): string {
    return `${this.CACHE_PREFIX}${videoId}`;
  }

  /**
   * 检查是否有缓存
   */
  static hasCache(videoId: string): boolean {
    try {
      const key = this.getCacheKey(videoId);
      const cached = localStorage.getItem(key);
      if (!cached) return false;

      const data: CachedVideoData = JSON.parse(cached);
      const now = Date.now();

      // 检查是否过期
      if (now - data.timestamp > this.CACHE_EXPIRY) {
        this.removeCache(videoId);
        return false;
      }

      return true;
    } catch (error) {
      console.warn("Cache check failed:", error);
      return false;
    }
  }

  /**
   * 获取缓存数据
   */
  static async getCache(videoId: string): Promise<CachedVideoData | null> {
    try {
      const key = this.getCacheKey(videoId);
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const data: CachedVideoData = JSON.parse(cached);
      const now = Date.now();

      // 检查是否过期
      if (now - data.timestamp > this.CACHE_EXPIRY) {
        this.removeCache(videoId);
        return null;
      }

      // 恢复Blob数据
      const audioBlob = await this.blobFromBase64(data.audioBlob as any);
      return {
        ...data,
        audioBlob,
      };
    } catch (error) {
      console.warn("Cache retrieval failed:", error);
      return null;
    }
  }

  /**
   * 保存缓存数据
   */
  static async setCache(
    videoId: string,
    audioBlob: Blob,
    rawTranscriptionData: RawTranscriptionData,
    subtitles: Subtitle[]
  ): Promise<void> {
    try {
      // 清理过期缓存
      this.cleanupExpiredCache();

      // 检查缓存大小
      if (!this.hasSpaceForCache(audioBlob.size)) {
        this.cleanupOldCache();
      }

      const audioBase64 = await this.blobToBase64(audioBlob);
      const data: CachedVideoData = {
        videoId,
        audioBlob: audioBase64 as any,
        rawTranscriptionData,
        subtitles,
        timestamp: Date.now(),
        fileSize: audioBlob.size,
      };

      const key = this.getCacheKey(videoId);
      localStorage.setItem(key, JSON.stringify(data));

      console.log(`Cache saved for video: ${videoId}`);
    } catch (error) {
      console.warn("Cache save failed:", error);
    }
  }

  /**
   * 移除缓存
   */
  static removeCache(videoId: string): void {
    try {
      const key = this.getCacheKey(videoId);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Cache removal failed:", error);
    }
  }

  /**
   * 清理过期缓存
   */
  private static cleanupExpiredCache(): void {
    try {
      const now = Date.now();
      const keys = Object.keys(localStorage);

      for (const key of keys) {
        if (key.startsWith(this.CACHE_PREFIX)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const data: CachedVideoData = JSON.parse(cached);
              if (now - data.timestamp > this.CACHE_EXPIRY) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // 删除损坏的缓存
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn("Cache cleanup failed:", error);
    }
  }

  /**
   * 清理旧缓存（按时间排序）
   */
  private static cleanupOldCache(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheEntries: Array<{ key: string; timestamp: number }> = [];

      for (const key of keys) {
        if (key.startsWith(this.CACHE_PREFIX)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const data: CachedVideoData = JSON.parse(cached);
              cacheEntries.push({ key, timestamp: data.timestamp });
            }
          } catch (error) {
            localStorage.removeItem(key);
          }
        }
      }

      // 按时间排序，删除最旧的
      cacheEntries.sort((a, b) => a.timestamp - b.timestamp);

      // 删除前20%的旧缓存
      const deleteCount = Math.ceil(cacheEntries.length * 0.2);
      for (let i = 0; i < deleteCount; i++) {
        localStorage.removeItem(cacheEntries[i].key);
      }
    } catch (error) {
      console.warn("Old cache cleanup failed:", error);
    }
  }

  /**
   * 检查是否有足够空间
   */
  private static hasSpaceForCache(newSize: number): boolean {
    try {
      let totalSize = 0;
      const keys = Object.keys(localStorage);

      for (const key of keys) {
        if (key.startsWith(this.CACHE_PREFIX)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const data: CachedVideoData = JSON.parse(cached);
              totalSize += data.fileSize;
            }
          } catch (error) {
            // 忽略损坏的缓存
          }
        }
      }

      return totalSize + newSize <= this.MAX_CACHE_SIZE;
    } catch (error) {
      console.warn("Cache size check failed:", error);
      return false;
    }
  }

  /**
   * Blob转Base64
   */
  private static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Base64转Blob
   */
  private static async blobFromBase64(base64: string): Promise<Blob> {
    const response = await fetch(base64);
    return response.blob();
  }

  /**
   * 获取缓存统计信息
   */
  static getCacheStats(): { count: number; totalSize: number } {
    try {
      let count = 0;
      let totalSize = 0;
      const keys = Object.keys(localStorage);

      for (const key of keys) {
        if (key.startsWith(this.CACHE_PREFIX)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const data: CachedVideoData = JSON.parse(cached);
              count++;
              totalSize += data.fileSize;
            }
          } catch (error) {
            // 忽略损坏的缓存
          }
        }
      }

      return { count, totalSize };
    } catch (error) {
      console.warn("Cache stats failed:", error);
      return { count: 0, totalSize: 0 };
    }
  }

  /**
   * 清空所有缓存
   */
  static clearAllCache(): void {
    try {
      const keys = Object.keys(localStorage);

      for (const key of keys) {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      }

      console.log("All cache cleared");
    } catch (error) {
      console.warn("Cache clear failed:", error);
    }
  }
}
