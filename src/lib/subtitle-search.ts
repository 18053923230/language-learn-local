import { Subtitle } from "@/types/subtitle";
import { SubtitleRecord } from "@/lib/subtitle-storage";
import { subtitleStorage } from "@/lib/subtitle-storage";
import { VideoSegment } from "@/lib/video-generator";

export interface SearchResult {
  subtitle: Subtitle;
  record: SubtitleRecord;
  matchType: "exact" | "partial" | "fuzzy";
  relevance: number; // 0-1, 相关性分数
  context: string; // 上下文文本
}

export interface SearchOptions {
  caseSensitive?: boolean;
  exactMatch?: boolean;
  includePartial?: boolean;
  fuzzyMatch?: boolean;
  maxResults?: number;
  minRelevance?: number;
  language?: string;
  source?: "assemblyai" | "upload" | "manual" | "all";
}

export interface MultiVideoSearchResult {
  keyword: string;
  results: SearchResult[];
  totalVideos: number;
  totalSubtitles: number;
  matchedSubtitles: number;
  videoSegments: VideoSegment[];
  searchTime: number;
}

export class SubtitleSearchService {
  /**
   * 从所有字幕记录中搜索包含关键词的字幕
   */
  async searchAcrossAllVideos(
    keyword: string,
    options: SearchOptions = {}
  ): Promise<MultiVideoSearchResult> {
    const startTime = Date.now();

    const {
      caseSensitive = false,
      exactMatch = false,
      includePartial = true,
      fuzzyMatch = false,
      maxResults = 100,
      minRelevance = 0.1,
      language,
      source = "all",
    } = options;

    try {
      // 获取所有字幕记录
      const allRecords = await subtitleStorage.getAllSubtitleRecords();

      // 过滤记录
      let filteredRecords = allRecords;

      if (language) {
        filteredRecords = filteredRecords.filter(
          (record) => record.language === language
        );
      }

      if (source !== "all") {
        filteredRecords = filteredRecords.filter(
          (record) => record.source === source
        );
      }

      const results: SearchResult[] = [];
      const videoSegments: VideoSegment[] = [];
      const processedVideos = new Set<string>();

      // 搜索每个记录
      for (const record of filteredRecords) {
        const recordResults = this.searchInRecord(record, keyword, {
          caseSensitive,
          exactMatch,
          includePartial,
          fuzzyMatch,
          minRelevance,
        });

        results.push(...recordResults);
        processedVideos.add(record.videoId);

        // 为匹配的字幕创建视频片段
        for (const result of recordResults) {
          // 尝试从视频缓存中获取视频文件
          try {
            const videoCache = await this.getVideoFile(record.videoId);
            if (videoCache) {
              videoSegments.push({
                subtitle: result.subtitle,
                videoFile: videoCache,
                startTime: result.subtitle.start,
                endTime: result.subtitle.end,
              });
            }
          } catch (error) {
            console.warn(
              `Could not get video file for ${record.videoId}:`,
              error
            );
            // 如果没有视频文件，仍然添加字幕结果，但不包含视频文件
            videoSegments.push({
              subtitle: result.subtitle,
              videoFile: null as any,
              startTime: result.subtitle.start,
              endTime: result.subtitle.end,
            });
          }
        }

        // 限制结果数量
        if (results.length >= maxResults) {
          break;
        }
      }

      // 按相关性排序
      results.sort((a, b) => b.relevance - a.relevance);

      const searchTime = Date.now() - startTime;

      return {
        keyword,
        results: results.slice(0, maxResults),
        totalVideos: processedVideos.size,
        totalSubtitles: filteredRecords.reduce(
          (sum, record) => sum + record.subtitles.length,
          0
        ),
        matchedSubtitles: results.length,
        videoSegments: videoSegments.slice(0, maxResults),
        searchTime,
      };
    } catch (error) {
      console.error("Error searching across videos:", error);
      throw new Error("Failed to search across videos");
    }
  }

  /**
   * 在单个字幕记录中搜索
   */
  private searchInRecord(
    record: SubtitleRecord,
    keyword: string,
    options: {
      caseSensitive: boolean;
      exactMatch: boolean;
      includePartial: boolean;
      fuzzyMatch: boolean;
      minRelevance: number;
    }
  ): SearchResult[] {
    const results: SearchResult[] = [];
    const searchKeyword = options.caseSensitive
      ? keyword
      : keyword.toLowerCase();

    for (const subtitle of record.subtitles) {
      const subtitleText = options.caseSensitive
        ? subtitle.text
        : subtitle.text.toLowerCase();
      let matchType: "exact" | "partial" | "fuzzy" | null = null;
      let relevance = 0;

      // 精确匹配
      if (options.exactMatch) {
        if (subtitleText === searchKeyword) {
          matchType = "exact";
          relevance = 1.0;
        }
      }

      // 部分匹配
      if (!matchType && options.includePartial) {
        if (subtitleText.includes(searchKeyword)) {
          matchType = "partial";
          relevance = this.calculatePartialRelevance(
            subtitleText,
            searchKeyword
          );
        }
      }

      // 模糊匹配
      if (!matchType && options.fuzzyMatch) {
        const fuzzyScore = this.calculateFuzzyMatch(
          subtitleText,
          searchKeyword
        );
        if (fuzzyScore > 0.7) {
          // 模糊匹配阈值
          matchType = "fuzzy";
          relevance = fuzzyScore;
        }
      }

      if (matchType && relevance >= options.minRelevance) {
        results.push({
          subtitle,
          record,
          matchType,
          relevance,
          context: this.extractContext(subtitle, record.subtitles),
        });
      }
    }

    return results;
  }

  /**
   * 计算部分匹配的相关性
   */
  private calculatePartialRelevance(text: string, keyword: string): number {
    const keywordLength = keyword.length;
    const textLength = text.length;

    // 关键词在文本中的位置影响相关性
    const index = text.indexOf(keyword);
    const positionFactor =
      index === 0 ? 1.0 : Math.max(0.5, 1 - index / textLength);

    // 关键词长度相对于文本长度的比例
    const lengthFactor = Math.min(1.0, keywordLength / textLength);

    return (positionFactor + lengthFactor) / 2;
  }

  /**
   * 计算模糊匹配分数
   */
  private calculateFuzzyMatch(text: string, keyword: string): number {
    // 简单的编辑距离算法
    const distance = this.levenshteinDistance(text, keyword);
    const maxLength = Math.max(text.length, keyword.length);
    return Math.max(0, 1 - distance / maxLength);
  }

  /**
   * 计算编辑距离
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * 提取字幕上下文
   */
  private extractContext(subtitle: Subtitle, allSubtitles: Subtitle[]): string {
    const currentIndex = allSubtitles.findIndex((s) => s.id === subtitle.id);
    if (currentIndex === -1) return subtitle.text;

    const contextSize = 2; // 前后各2个字幕
    const startIndex = Math.max(0, currentIndex - contextSize);
    const endIndex = Math.min(
      allSubtitles.length,
      currentIndex + contextSize + 1
    );

    const contextSubtitles = allSubtitles.slice(startIndex, endIndex);
    return contextSubtitles.map((s) => s.text).join(" ");
  }

  /**
   * 搜索特定语言的视频
   */
  async searchByLanguage(
    keyword: string,
    language: string,
    options: SearchOptions = {}
  ): Promise<MultiVideoSearchResult> {
    return this.searchAcrossAllVideos(keyword, {
      ...options,
      language,
    });
  }

  /**
   * 搜索特定来源的字幕
   */
  async searchBySource(
    keyword: string,
    source: "assemblyai" | "upload" | "manual",
    options: SearchOptions = {}
  ): Promise<MultiVideoSearchResult> {
    return this.searchAcrossAllVideos(keyword, {
      ...options,
      source,
    });
  }

  /**
   * 尝试获取视频文件
   */
  private async getVideoFile(videoId: string): Promise<File | null> {
    try {
      // 从视频存储服务获取文件
      const { videoStorageService } = await import("./video-storage");
      return await videoStorageService.getVideoFile(videoId);
    } catch (error) {
      console.error(`Error getting video file for ${videoId}:`, error);
      return null;
    }
  }

  /**
   * 获取搜索统计信息
   */
  async getSearchStats(): Promise<{
    totalVideos: number;
    totalSubtitles: number;
    languages: string[];
    sources: { [key: string]: number };
    averageConfidence: number;
  }> {
    try {
      const allRecords = await subtitleStorage.getAllSubtitleRecords();

      const languages = [
        ...new Set(allRecords.map((record) => record.language)),
      ];
      const sources: { [key: string]: number } = {};

      allRecords.forEach((record) => {
        sources[record.source] = (sources[record.source] || 0) + 1;
      });

      const totalSubtitles = allRecords.reduce(
        (sum, record) => sum + record.subtitles.length,
        0
      );
      const totalConfidence = allRecords.reduce(
        (sum, record) => sum + record.confidence,
        0
      );
      const averageConfidence =
        allRecords.length > 0 ? totalConfidence / allRecords.length : 0;

      return {
        totalVideos: allRecords.length,
        totalSubtitles,
        languages,
        sources,
        averageConfidence,
      };
    } catch (error) {
      console.error("Error getting search stats:", error);
      throw new Error("Failed to get search stats");
    }
  }

  /**
   * 获取热门关键词建议
   */
  async getKeywordSuggestions(
    partialKeyword: string,
    limit: number = 10
  ): Promise<string[]> {
    try {
      const allRecords = await subtitleStorage.getAllSubtitleRecords();
      const wordFrequency: { [key: string]: number } = {};

      // 统计所有字幕中的单词频率
      for (const record of allRecords) {
        for (const subtitle of record.subtitles) {
          const words = subtitle.text
            .toLowerCase()
            .replace(/[^\w\s]/g, " ")
            .split(/\s+/)
            .filter((word) => word.length > 2);

          for (const word of words) {
            if (word.toLowerCase().includes(partialKeyword.toLowerCase())) {
              wordFrequency[word] = (wordFrequency[word] || 0) + 1;
            }
          }
        }
      }

      // 按频率排序并返回建议
      return Object.entries(wordFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([word]) => word);
    } catch (error) {
      console.error("Error getting keyword suggestions:", error);
      return [];
    }
  }
}

// 导出单例实例
export const subtitleSearchService = new SubtitleSearchService();
