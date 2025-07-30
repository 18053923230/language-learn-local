import Dexie, { Table } from "dexie";
import {
  VideoSegment,
  VideoSegmentFolder,
  SegmentGenerationOptions,
} from "@/types/video-segment";
import { Subtitle } from "@/types/subtitle";
import { Video } from "@/types/video";

// 视频片段数据库
class VideoSegmentDatabase extends Dexie {
  segments!: Table<VideoSegment>;
  folders!: Table<VideoSegmentFolder>;

  constructor() {
    super("VideoSegmentDB");
    this.version(1).stores({
      segments: "id, videoId, subtitleId, folderName, status, createdAt",
      folders: "id, videoId, folderName, status, createdAt",
    });
  }
}

export class VideoSegmentStorage {
  private db: VideoSegmentDatabase;

  constructor() {
    this.db = new VideoSegmentDatabase();
  }

  // ==================== 文件夹管理 ====================

  /**
   * 创建片段文件夹记录
   */
  async createFolder(
    videoId: string,
    folderName: string,
    subtitles: Subtitle[],
    video: Video,
    options: SegmentGenerationOptions
  ): Promise<VideoSegmentFolder> {
    const folder: VideoSegmentFolder = {
      id: `folder_${videoId}_${Date.now()}`,
      videoId,
      folderName,
      folderPath: `segments/${folderName}`,
      totalSegments: subtitles.length,
      completedSegments: 0,
      totalSize: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "pending",
      metadata: {
        originalVideoName: video.name,
        originalVideoSize: video.size,
        language: video.language,
        generationOptions: options,
      },
    };

    await this.db.folders.add(folder);
    return folder;
  }

  /**
   * 获取视频的所有片段文件夹
   */
  async getFoldersByVideoId(videoId: string): Promise<VideoSegmentFolder[]> {
    return await this.db.folders
      .where("videoId")
      .equals(videoId)
      .reverse()
      .sortBy("createdAt");
  }

  /**
   * 获取文件夹信息
   */
  async getFolder(folderId: string): Promise<VideoSegmentFolder | undefined> {
    return await this.db.folders.get(folderId);
  }

  /**
   * 更新文件夹状态
   */
  async updateFolderStatus(
    folderId: string,
    status: VideoSegmentFolder["status"],
    completedSegments?: number,
    totalSize?: number
  ): Promise<void> {
    const updateData: Partial<VideoSegmentFolder> = {
      status,
      updatedAt: new Date(),
    };

    if (completedSegments !== undefined) {
      updateData.completedSegments = completedSegments;
    }

    if (totalSize !== undefined) {
      updateData.totalSize = totalSize;
    }

    await this.db.folders.update(folderId, updateData);
  }

  /**
   * 删除文件夹及其所有片段
   */
  async deleteFolder(folderId: string): Promise<void> {
    await this.db.transaction(
      "rw",
      [this.db.folders, this.db.segments],
      async () => {
        // 删除文件夹
        await this.db.folders.delete(folderId);

        // 删除该文件夹下的所有片段
        await this.db.segments.where("folderName").equals(folderId).delete();
      }
    );
  }

  // ==================== 片段管理 ====================

  /**
   * 创建片段记录
   */
  async createSegment(
    videoId: string,
    subtitle: Subtitle,
    folderName: string,
    fileName: string,
    options: SegmentGenerationOptions
  ): Promise<VideoSegment> {
    const segment: VideoSegment = {
      id: `segment_${videoId}_${subtitle.id}_${Date.now()}`,
      videoId,
      subtitleId: subtitle.id,
      folderName,
      fileName,
      filePath: `segments/${folderName}/${fileName}`,
      subtitle,
      duration: subtitle.end - subtitle.start,
      size: 0,
      format: options.format,
      quality: options.quality,
      resolution: options.resolution,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "pending",
    };

    await this.db.segments.add(segment);
    return segment;
  }

  /**
   * 批量创建片段记录
   */
  async createSegments(
    videoId: string,
    subtitles: Subtitle[],
    folderName: string,
    options: SegmentGenerationOptions
  ): Promise<VideoSegment[]> {
    const segments: VideoSegment[] = subtitles.map((subtitle, index) => ({
      id: `segment_${videoId}_${subtitle.id}_${Date.now()}_${index}`,
      videoId,
      subtitleId: subtitle.id,
      folderName,
      fileName: `segment_${index + 1}_${this.sanitizeFileName(subtitle.text)}.${
        options.format
      }`,
      filePath: `segments/${folderName}/segment_${
        index + 1
      }_${this.sanitizeFileName(subtitle.text)}.${options.format}`,
      subtitle,
      duration: subtitle.end - subtitle.start,
      size: 0,
      format: options.format,
      quality: options.quality,
      resolution: options.resolution,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "pending",
    }));

    await this.db.segments.bulkAdd(segments);
    return segments;
  }

  /**
   * 获取文件夹下的所有片段
   */
  async getSegmentsByFolder(folderName: string): Promise<VideoSegment[]> {
    return await this.db.segments
      .where("folderName")
      .equals(folderName)
      .sortBy("createdAt");
  }

  /**
   * 获取视频的所有片段
   */
  async getSegmentsByVideoId(videoId: string): Promise<VideoSegment[]> {
    return await this.db.segments
      .where("videoId")
      .equals(videoId)
      .sortBy("createdAt");
  }

  /**
   * 更新片段状态
   */
  async updateSegmentStatus(
    segmentId: string,
    status: VideoSegment["status"],
    size?: number,
    error?: string
  ): Promise<void> {
    const updateData: Partial<VideoSegment> = {
      status,
      updatedAt: new Date(),
    };

    if (size !== undefined) {
      updateData.size = size;
    }

    if (error !== undefined) {
      updateData.error = error;
    }

    await this.db.segments.update(segmentId, updateData);
  }

  /**
   * 检查片段是否已存在
   */
  async checkSegmentExists(
    videoId: string,
    subtitleId: string,
    folderName: string
  ): Promise<VideoSegment | undefined> {
    return await this.db.segments
      .where(["videoId", "subtitleId", "folderName"])
      .equals([videoId, subtitleId, folderName])
      .first();
  }

  /**
   * 检查文件夹是否已存在
   */
  async checkFolderExists(
    videoId: string,
    folderName: string
  ): Promise<VideoSegmentFolder | undefined> {
    return await this.db.folders
      .where(["videoId", "folderName"])
      .equals([videoId, folderName])
      .first();
  }

  /**
   * 获取片段统计信息
   */
  async getSegmentStats(videoId: string): Promise<{
    totalFolders: number;
    totalSegments: number;
    completedSegments: number;
    totalSize: number;
  }> {
    const folders = await this.getFoldersByVideoId(videoId);
    const segments = await this.getSegmentsByVideoId(videoId);

    return {
      totalFolders: folders.length,
      totalSegments: segments.length,
      completedSegments: segments.filter((s) => s.status === "completed")
        .length,
      totalSize: segments.reduce((sum, s) => sum + s.size, 0),
    };
  }

  /**
   * 清理失败的片段
   */
  async cleanupFailedSegments(folderName: string): Promise<void> {
    await this.db.segments
      .where(["folderName", "status"])
      .equals([folderName, "failed"])
      .delete();
  }

  /**
   * 获取所有片段
   */
  async getAllSegments(): Promise<VideoSegment[]> {
    return await this.db.segments.toArray();
  }

  /**
   * 获取所有文件夹
   */
  async getAllFolders(): Promise<VideoSegmentFolder[]> {
    return await this.db.folders.toArray();
  }

  /**
   * 根据片段ID获取片段
   */
  async getSegmentById(segmentId: string): Promise<VideoSegment | undefined> {
    return await this.db.segments.get(segmentId);
  }

  /**
   * 根据片段文本搜索片段
   */
  async searchSegmentsByText(text: string): Promise<VideoSegment[]> {
    return await this.db.segments
      .filter((segment) =>
        segment.subtitle.text.toLowerCase().includes(text.toLowerCase())
      )
      .toArray();
  }

  /**
   * 清理文件名，移除非法字符
   */
  private sanitizeFileName(text: string): string {
    return text
      .replace(/[<>:"/\\|?*]/g, "_")
      .replace(/\s+/g, "_")
      .substring(0, 50); // 限制长度
  }
}

// 导出单例实例
export const videoSegmentStorage = new VideoSegmentStorage();
