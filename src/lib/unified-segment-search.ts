import { Subtitle } from "@/types/subtitle";
import { VideoSegment, VideoSegmentFolder } from "@/types/video-segment";
import { videoSegmentStorage } from "./video-segment-storage";
import { subtitleSearchService } from "./subtitle-search";

export interface UnifiedSearchResult {
  type: "subtitle" | "segment";
  id: string;
  videoId: string;
  videoName: string;
  language: string;
  text: string;
  startTime: number;
  endTime: number;
  duration: number;
  confidence?: number;
  source: "assemblyai" | "upload" | "manual";
  matchType: "exact" | "partial" | "fuzzy";
  relevance: number;
  // 片段特有属性
  segmentId?: string;
  folderName?: string;
  fileName?: string;
  fileSize?: number;
  status?: "pending" | "processing" | "completed" | "failed";
  // 字幕特有属性
  subtitleId?: string;
  recordId?: string;
}

export interface UnifiedSearchOptions {
  caseSensitive?: boolean;
  exactMatch?: boolean;
  includePartial?: boolean;
  fuzzyMatch?: boolean;
  maxResults?: number;
  minRelevance?: number;
  language?: string;
  source?: "all" | "assemblyai" | "upload" | "manual";
  // 片段搜索特有选项
  includeSegments?: boolean;
  includeSubtitles?: boolean;
  segmentStatus?: "all" | "completed" | "processing" | "failed";
}

export interface UnifiedSearchResponse {
  results: UnifiedSearchResult[];
  totalResults: number;
  totalVideos: number;
  searchTime: number;
  matchedSubtitles: number;
  matchedSegments: number;
  // 统计信息
  stats: {
    totalVideos: number;
    totalSubtitles: number;
    totalSegments: number;
    languages: string[];
    sources: { [key: string]: number };
    averageConfidence: number;
  };
}

export class UnifiedSegmentSearchService {
  private static instance: UnifiedSegmentSearchService;

  private constructor() {}

  static getInstance(): UnifiedSegmentSearchService {
    if (!UnifiedSegmentSearchService.instance) {
      UnifiedSegmentSearchService.instance = new UnifiedSegmentSearchService();
    }
    return UnifiedSegmentSearchService.instance;
  }

  /**
   * 统一搜索：同时搜索字幕和片段库
   */
  async search(
    keyword: string,
    options: UnifiedSearchOptions = {}
  ): Promise<UnifiedSearchResponse> {
    const startTime = Date.now();
    const defaultOptions: UnifiedSearchOptions = {
      caseSensitive: false,
      exactMatch: false,
      includePartial: true,
      fuzzyMatch: false,
      maxResults: 50,
      minRelevance: 0.3,
      includeSegments: true,
      includeSubtitles: true,
      segmentStatus: "all",
      ...options,
    };

    const results: UnifiedSearchResult[] = [];
    let matchedSubtitles = 0;
    let matchedSegments = 0;

    // 1. 搜索字幕库
    if (defaultOptions.includeSubtitles) {
      try {
        const subtitleResults =
          await subtitleSearchService.searchAcrossAllVideos(keyword, {
            caseSensitive: defaultOptions.caseSensitive,
            exactMatch: defaultOptions.exactMatch,
            includePartial: defaultOptions.includePartial,
            fuzzyMatch: defaultOptions.fuzzyMatch,
            maxResults: defaultOptions.maxResults,
            minRelevance: defaultOptions.minRelevance,
            language: defaultOptions.language,
            source: defaultOptions.source,
          });

        // 转换字幕搜索结果
        const subtitleResultsConverted: UnifiedSearchResult[] =
          subtitleResults.results.map((result) => ({
            type: "subtitle" as const,
            id: `${result.record.id}-${result.subtitle.id}`,
            videoId: result.record.videoId,
            videoName: result.record.videoName,
            language: result.record.language,
            text: result.subtitle.text,
            startTime: result.subtitle.start,
            endTime: result.subtitle.end,
            duration: result.subtitle.end - result.subtitle.start,
            confidence: result.record.confidence,
            source: result.record.source,
            matchType: result.matchType,
            relevance: result.relevance,
            subtitleId: result.subtitle.id,
            recordId: result.record.id,
          }));

        results.push(...subtitleResultsConverted);
        matchedSubtitles = subtitleResults.matchedSubtitles;
      } catch (error) {
        console.error("Error searching subtitles:", error);
      }
    }

    // 2. 搜索片段库
    if (defaultOptions.includeSegments) {
      try {
        const segmentResults = await this.searchSegments(
          keyword,
          defaultOptions
        );
        results.push(...segmentResults);
        matchedSegments = segmentResults.length;
      } catch (error) {
        console.error("Error searching segments:", error);
      }
    }

    // 3. 按相关性排序
    results.sort((a, b) => b.relevance - a.relevance);

    // 4. 限制结果数量
    const limitedResults = results.slice(0, defaultOptions.maxResults);

    // 5. 获取统计信息
    const stats = await this.getSearchStats();

    const searchTime = Date.now() - startTime;

    return {
      results: limitedResults,
      totalResults: limitedResults.length,
      totalVideos: new Set(limitedResults.map((r) => r.videoId)).size,
      searchTime,
      matchedSubtitles,
      matchedSegments,
      stats,
    };
  }

  /**
   * 搜索片段库
   */
  private async searchSegments(
    keyword: string,
    options: UnifiedSearchOptions
  ): Promise<UnifiedSearchResult[]> {
    const allFolders = await videoSegmentStorage.getAllFolders();
    const results: UnifiedSearchResult[] = [];

    for (const folder of allFolders) {
      const segments = await videoSegmentStorage.getSegmentsByFolder(
        folder.folderName
      );

      for (const segment of segments) {
        // 检查状态过滤
        if (
          options.segmentStatus !== "all" &&
          segment.status !== options.segmentStatus
        ) {
          continue;
        }

        // 搜索匹配
        const matchResult = this.matchSegment(segment, keyword, options);
        if (matchResult.matched) {
          results.push({
            type: "segment" as const,
            id: segment.id,
            videoId: segment.videoId,
            videoName: segment.fileName,
            language: "unknown",
            text: segment.subtitle.text,
            startTime: segment.subtitle.start,
            endTime: segment.subtitle.end,
            duration: segment.subtitle.end - segment.subtitle.start,
            source: "manual",
            matchType: matchResult.matchType,
            relevance: matchResult.relevance,
            segmentId: segment.id,
            folderName: folder.folderName,
            fileName: segment.fileName,
            fileSize: segment.size,
            status: segment.status,
          });
        }
      }
    }

    return results;
  }

  /**
   * 匹配片段
   */
  private matchSegment(
    segment: VideoSegment,
    keyword: string,
    options: UnifiedSearchOptions
  ): {
    matched: boolean;
    matchType: "exact" | "partial" | "fuzzy";
    relevance: number;
  } {
    const text = segment.subtitle.text;
    const searchText = options.caseSensitive ? text : text.toLowerCase();
    const searchKeyword = options.caseSensitive
      ? keyword
      : keyword.toLowerCase();

    // 精确匹配
    if (options.exactMatch) {
      if (searchText === searchKeyword) {
        return { matched: true, matchType: "exact", relevance: 1.0 };
      }
      return { matched: false, matchType: "exact", relevance: 0 };
    }

    // 包含匹配
    if (options.includePartial) {
      if (searchText.includes(searchKeyword)) {
        const relevance = searchKeyword.length / searchText.length;
        return {
          matched: true,
          matchType: "partial",
          relevance: Math.max(relevance, 0.3),
        };
      }
    }

    // 模糊匹配
    if (options.fuzzyMatch) {
      const similarity = this.calculateSimilarity(searchText, searchKeyword);
      if (similarity >= (options.minRelevance || 0.3)) {
        return {
          matched: true,
          matchType: "fuzzy",
          relevance: similarity,
        };
      }
    }

    return { matched: false, matchType: "exact", relevance: 0 };
  }

  /**
   * 计算文本相似度（简单的编辑距离）
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const longer = text1.length > text2.length ? text1 : text2;
    const shorter = text1.length > text2.length ? text2 : text1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * 计算编辑距离
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * 获取搜索统计信息
   */
  async getSearchStats(): Promise<UnifiedSearchResponse["stats"]> {
    try {
      // 获取字幕统计
      const subtitleStats = await subtitleSearchService.getSearchStats();

      // 获取片段统计
      const allFolders = await videoSegmentStorage.getAllFolders();
      const allSegments = await videoSegmentStorage.getAllSegments();

      const segmentStats = {
        totalSegments: allSegments.length,
        completedSegments: allSegments.filter((s) => s.status === "completed")
          .length,
        processingSegments: allSegments.filter((s) => s.status === "processing")
          .length,
        failedSegments: allSegments.filter((s) => s.status === "failed").length,
      };

      return {
        totalVideos: subtitleStats.totalVideos,
        totalSubtitles: subtitleStats.totalSubtitles,
        totalSegments: segmentStats.totalSegments,
        languages: subtitleStats.languages,
        sources: subtitleStats.sources,
        averageConfidence: subtitleStats.averageConfidence,
      };
    } catch (error) {
      console.error("Error getting search stats:", error);
      return {
        totalVideos: 0,
        totalSubtitles: 0,
        totalSegments: 0,
        languages: [],
        sources: {},
        averageConfidence: 0,
      };
    }
  }

  /**
   * 获取关键词建议
   */
  async getKeywordSuggestions(
    partial: string,
    limit: number = 5
  ): Promise<string[]> {
    const suggestions: string[] = [];

    try {
      // 从字幕库获取建议
      const subtitleSuggestions =
        await subtitleSearchService.getKeywordSuggestions(partial, limit);
      suggestions.push(...subtitleSuggestions);

      // 从片段库获取建议
      const allSegments = await videoSegmentStorage.getAllSegments();
      const segmentTexts = allSegments.map((s) => s.subtitle.text);

      const segmentSuggestions = segmentTexts
        .filter((text) => text.toLowerCase().includes(partial.toLowerCase()))
        .slice(0, limit);

      suggestions.push(...segmentSuggestions);

      // 去重并限制数量
      return [...new Set(suggestions)].slice(0, limit);
    } catch (error) {
      console.error("Error getting keyword suggestions:", error);
      return [];
    }
  }

  /**
   * 根据搜索结果生成片段（如果不存在）
   */
  async generateSegmentsFromSearchResults(
    searchResults: UnifiedSearchResult[],
    options: {
      format?: string;
      quality?: string;
      resolution?: string;
    } = {}
  ): Promise<VideoSegmentFolder[]> {
    const folders: VideoSegmentFolder[] = [];

    // 按视频分组
    const videoGroups = new Map<string, UnifiedSearchResult[]>();
    for (const result of searchResults) {
      if (!videoGroups.has(result.videoId)) {
        videoGroups.set(result.videoId, []);
      }
      videoGroups.get(result.videoId)!.push(result);
    }

    // 为每个视频生成片段
    for (const [videoId, results] of videoGroups) {
      try {
        // 这里需要获取视频文件和字幕信息
        // 暂时返回空数组，需要实现具体的生成逻辑
        console.log(
          `Generating segments for video ${videoId} with ${results.length} results`
        );
      } catch (error) {
        console.error(`Error generating segments for video ${videoId}:`, error);
      }
    }

    return folders;
  }
}

// 导出单例实例
export const unifiedSegmentSearchService =
  UnifiedSegmentSearchService.getInstance();
