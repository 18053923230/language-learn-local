import { Subtitle } from "@/types/subtitle";

export interface OptimizationOptions {
  mergeShortSegments?: boolean; // 合并过短的片段
  splitLongSegments?: boolean; // 分割过长的片段
  fixTiming?: boolean; // 修复时间重叠
  improveConfidence?: boolean; // 改善置信度
  maxSegmentLength?: number; // 最大片段长度（字符）
  minSegmentLength?: number; // 最小片段长度（字符）
  maxSegmentDuration?: number; // 最大片段时长（秒）
  minSegmentDuration?: number; // 最小片段时长（秒）
}

export class SubtitleOptimizer {
  private defaultOptions: OptimizationOptions = {
    mergeShortSegments: true,
    splitLongSegments: true,
    fixTiming: true,
    improveConfidence: true,
    maxSegmentLength: 120,
    minSegmentLength: 10,
    maxSegmentDuration: 8,
    minSegmentDuration: 1,
  };

  /**
   * 优化字幕数据
   */
  optimizeSubtitles(
    subtitles: Subtitle[],
    options: OptimizationOptions = {}
  ): Subtitle[] {
    const opts = { ...this.defaultOptions, ...options };
    let optimized = [...subtitles];

    // 1. 修复时间重叠
    if (opts.fixTiming) {
      optimized = this.fixTimingOverlaps(optimized);
    }

    // 2. 合并过短的片段
    if (opts.mergeShortSegments) {
      optimized = this.mergeShortSegments(optimized, opts);
    }

    // 3. 分割过长的片段
    if (opts.splitLongSegments) {
      optimized = this.splitLongSegments(optimized, opts);
    }

    // 4. 改善置信度
    if (opts.improveConfidence) {
      optimized = this.improveConfidence(optimized);
    }

    // 5. 重新分配ID
    optimized = this.reassignIds(optimized);

    return optimized;
  }

  /**
   * 修复时间重叠
   */
  private fixTimingOverlaps(subtitles: Subtitle[]): Subtitle[] {
    const fixed = [...subtitles];

    for (let i = 0; i < fixed.length - 1; i++) {
      const current = fixed[i];
      const next = fixed[i + 1];

      // 如果当前片段结束时间晚于下一片段开始时间
      if (current.end > next.start) {
        // 将当前片段结束时间设为下一片段开始时间
        current.end = next.start;
      }

      // 确保片段有最小时长
      if (current.end - current.start < 0.1) {
        current.end = current.start + 0.1;
      }
    }

    return fixed;
  }

  /**
   * 合并过短的片段
   */
  private mergeShortSegments(
    subtitles: Subtitle[],
    options: OptimizationOptions
  ): Subtitle[] {
    const merged: Subtitle[] = [];
    let currentSegment: Subtitle | null = null;

    for (const subtitle of subtitles) {
      const segmentLength = subtitle.text.length;
      const segmentDuration = subtitle.end - subtitle.start;
      const isShort =
        segmentLength < (options.minSegmentLength || 10) ||
        segmentDuration < (options.minSegmentDuration || 1);

      if (!currentSegment) {
        currentSegment = { ...subtitle };
      } else if (isShort && this.shouldMerge(currentSegment, subtitle)) {
        // 合并到当前片段
        currentSegment.text += " " + subtitle.text;
        currentSegment.end = subtitle.end;
        currentSegment.confidence = Math.min(
          currentSegment.confidence,
          subtitle.confidence
        );
      } else {
        // 完成当前片段，开始新片段
        merged.push(currentSegment);
        currentSegment = { ...subtitle };
      }
    }

    if (currentSegment) {
      merged.push(currentSegment);
    }

    return merged;
  }

  /**
   * 判断是否应该合并两个片段
   */
  private shouldMerge(segment1: Subtitle, segment2: Subtitle): boolean {
    const timeGap = segment2.start - segment1.end;
    const combinedLength = segment1.text.length + segment2.text.length;

    // 时间间隔小于1秒且合并后长度合理
    return timeGap < 1.0 && combinedLength < 150;
  }

  /**
   * 分割过长的片段
   */
  private splitLongSegments(
    subtitles: Subtitle[],
    options: OptimizationOptions
  ): Subtitle[] {
    const split: Subtitle[] = [];

    for (const subtitle of subtitles) {
      const segmentLength = subtitle.text.length;
      const segmentDuration = subtitle.end - subtitle.start;
      const isLong =
        segmentLength > (options.maxSegmentLength || 120) ||
        segmentDuration > (options.maxSegmentDuration || 8);

      if (isLong) {
        const splits = this.splitSegment(subtitle);
        split.push(...splits);
      } else {
        split.push(subtitle);
      }
    }

    return split;
  }

  /**
   * 分割单个长片段
   */
  private splitSegment(subtitle: Subtitle): Subtitle[] {
    const words = subtitle.text.split(/\s+/);
    const totalDuration = subtitle.end - subtitle.start;
    const wordCount = words.length;
    const durationPerWord = totalDuration / wordCount;

    const segments: Subtitle[] = [];
    let currentText = "";
    let currentStart = subtitle.start;
    let wordIndex = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      currentText += (currentText ? " " : "") + word;

      // 检查是否应该分段
      const shouldBreak = this.shouldBreakSegment(word, i, words);

      if (shouldBreak || i === words.length - 1) {
        const currentEnd = subtitle.start + (i + 1) * durationPerWord;

        segments.push({
          id: `${subtitle.id}_split_${segments.length}`,
          text: currentText.trim(),
          start: currentStart,
          end: currentEnd,
          confidence: subtitle.confidence,
          language: subtitle.language,
          videoId: subtitle.videoId,
        });

        currentText = "";
        currentStart = currentEnd;
      }
    }

    return segments;
  }

  /**
   * 判断是否应该分段
   */
  private shouldBreakSegment(
    word: string,
    index: number,
    words: string[]
  ): boolean {
    // 句末标点
    if (word.match(/[.!?]$/)) {
      return true;
    }

    // 段落标点
    if (word.match(/[:;]$/)) {
      return true;
    }

    // 逗号后的长停顿（模拟）
    if (word.match(/,$/) && index < words.length - 1) {
      const nextWord = words[index + 1];
      if (nextWord.match(/^[A-Z]/)) {
        return true;
      }
    }

    // 避免过长的片段
    if (index > 8) {
      return true;
    }

    return false;
  }

  /**
   * 改善置信度
   */
  private improveConfidence(subtitles: Subtitle[]): Subtitle[] {
    return subtitles.map((subtitle) => {
      // 如果置信度过低，尝试提升
      if (subtitle.confidence < 0.7) {
        // 基于文本长度和时长调整置信度
        const textQuality = Math.min(1, subtitle.text.length / 50);
        const durationQuality = Math.min(
          1,
          (subtitle.end - subtitle.start) / 3
        );
        const adjustedConfidence = Math.max(
          subtitle.confidence,
          (textQuality + durationQuality) / 2
        );

        return {
          ...subtitle,
          confidence: Math.min(0.95, adjustedConfidence),
        };
      }
      return subtitle;
    });
  }

  /**
   * 重新分配ID
   */
  private reassignIds(subtitles: Subtitle[]): Subtitle[] {
    return subtitles.map((subtitle, index) => ({
      ...subtitle,
      id: `optimized_segment_${index}`,
    }));
  }

  /**
   * 获取优化统计信息
   */
  getOptimizationStats(
    original: Subtitle[],
    optimized: Subtitle[]
  ): {
    originalCount: number;
    optimizedCount: number;
    averageLength: number;
    averageDuration: number;
    averageConfidence: number;
    improvements: string[];
  } {
    const improvements: string[] = [];

    if (optimized.length < original.length) {
      improvements.push(
        `合并了 ${original.length - optimized.length} 个短片段`
      );
    } else if (optimized.length > original.length) {
      improvements.push(
        `分割了 ${optimized.length - original.length} 个长片段`
      );
    }

    const avgLength =
      optimized.reduce((sum, s) => sum + s.text.length, 0) / optimized.length;
    const avgDuration =
      optimized.reduce((sum, s) => sum + (s.end - s.start), 0) /
      optimized.length;
    const avgConfidence =
      optimized.reduce((sum, s) => sum + s.confidence, 0) / optimized.length;

    return {
      originalCount: original.length,
      optimizedCount: optimized.length,
      averageLength: Math.round(avgLength),
      averageDuration: Math.round(avgDuration * 100) / 100,
      averageConfidence: Math.round(avgConfidence * 100) / 100,
      improvements,
    };
  }
}

// 导出单例实例
export const subtitleOptimizer = new SubtitleOptimizer();
