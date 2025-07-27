import { Subtitle } from "@/types/subtitle";
import { RawTranscriptionData } from "@/types/raw-transcription";

export interface SubtitleGenerationConfig {
  // 句末标点符号
  sentenceEndPunctuation: string[];
  // 最小段落时长（秒）
  minSegmentDuration: number;
  // 最大段落时长（秒）
  maxSegmentDuration: number;
  // 是否保留填充词
  keepDisfluencies: boolean;
  // 最低置信度
  minConfidence: number;
}

export class SubtitleGenerator {
  private config: SubtitleGenerationConfig;

  constructor(config?: Partial<SubtitleGenerationConfig>) {
    this.config = {
      sentenceEndPunctuation: [".", "!", "?"],
      minSegmentDuration: 0.1, // 降低最小时长，允许短句
      maxSegmentDuration: 60.0, // 增加最大时长，避免强制分段
      keepDisfluencies: false,
      minConfidence: 0.0,
      ...config,
    };
  }

  /**
   * 从原始数据生成基于句末标点的字幕
   */
  generateFromRawData(rawData: RawTranscriptionData): Subtitle[] {
    const { words, utterances } = rawData.assemblyData;

    if (!words || words.length === 0) {
      console.warn("No words data available for subtitle generation");
      return [];
    }

    // 过滤低置信度的单词
    const filteredWords = words.filter(
      (word) => word.confidence >= this.config.minConfidence
    );

    if (filteredWords.length === 0) {
      console.warn("No words meet the confidence threshold");
      return [];
    }

    // 基于句末标点进行分段
    const segments = this.segmentByPunctuation(filteredWords);

    // 转换为字幕格式
    return segments.map((segment, index) => ({
      id: `${rawData.videoId}_segment_${index}`,
      text: segment.text.trim(),
      start: segment.start / 1000, // 转换为秒
      end: segment.end / 1000,
      confidence: segment.confidence,
      language: rawData.language,
      videoId: rawData.videoId,
    }));
  }

  /**
   * 基于句末标点进行分段
   */
  private segmentByPunctuation(words: any[]): Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }> {
    const segments: Array<{
      text: string;
      start: number;
      end: number;
      confidence: number;
    }> = [];

    let currentSegment: {
      text: string;
      start: number;
      end: number;
      confidence: number;
      wordCount: number;
    } | null = null;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const isLastWord = i === words.length - 1;

      // 检查是否是句末标点
      const isSentenceEnd = this.isSentenceEnd(word.text);

      // 开始新段落
      if (!currentSegment) {
        currentSegment = {
          text: word.text,
          start: word.start,
          end: word.end,
          confidence: word.confidence,
          wordCount: 1,
        };
      } else {
        // 添加到当前段落
        currentSegment.text += " " + word.text;
        currentSegment.end = word.end;
        currentSegment.confidence = Math.min(
          currentSegment.confidence,
          word.confidence
        );
        currentSegment.wordCount++;
      }

      // 检查是否需要结束当前段落 - 只根据句末标点
      const shouldEndSegment = isSentenceEnd || isLastWord;

      if (shouldEndSegment && currentSegment) {
        // 直接添加段落，不进行时长验证
        segments.push({
          text: currentSegment.text,
          start: currentSegment.start,
          end: currentSegment.end,
          confidence: currentSegment.confidence,
        });

        currentSegment = null;
      }
    }

    return segments;
  }

  /**
   * 检查单词是否以句末标点结尾
   */
  private isSentenceEnd(wordText: string): boolean {
    return this.config.sentenceEndPunctuation.some((punct) =>
      wordText.trim().endsWith(punct)
    );
  }

  /**
   * 获取生成统计信息
   */
  getGenerationStats(rawData: RawTranscriptionData): {
    totalWords: number;
    totalSegments: number;
    averageSegmentLength: number;
    averageConfidence: number;
    totalDuration: number;
  } {
    const subtitles = this.generateFromRawData(rawData);

    if (subtitles.length === 0) {
      return {
        totalWords: 0,
        totalSegments: 0,
        averageSegmentLength: 0,
        averageConfidence: 0,
        totalDuration: 0,
      };
    }

    const totalWords = subtitles.reduce(
      (sum, sub) => sum + sub.text.split(" ").length,
      0
    );

    const averageSegmentLength = totalWords / subtitles.length;
    const averageConfidence =
      subtitles.reduce((sum, sub) => sum + sub.confidence, 0) /
      subtitles.length;

    const totalDuration = Math.max(...subtitles.map((s) => s.end));

    return {
      totalWords,
      totalSegments: subtitles.length,
      averageSegmentLength,
      averageConfidence,
      totalDuration,
    };
  }
}

// 导出默认配置的生成器实例
export const defaultSubtitleGenerator = new SubtitleGenerator();
