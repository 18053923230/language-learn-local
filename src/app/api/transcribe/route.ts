import { NextRequest, NextResponse } from "next/server";

const ASSEMBLYAI_API_KEY =
  process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY ||
  "2850bbdad3fa41c3b18735f524c20191";
const ASSEMBLYAI_BASE_URL = "https://api.assemblyai.com/v2";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const language = (formData.get("language") as string) || "en";

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Step 1: Upload audio to AssemblyAI
    const uploadResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: ASSEMBLYAI_API_KEY,
      },
      body: audioFile,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Upload error:", errorText);
      return NextResponse.json(
        { error: `Upload failed: ${uploadResponse.status}` },
        { status: uploadResponse.status }
      );
    }

    const uploadResult = await uploadResponse.json();
    const audioUrl = uploadResult.upload_url;

    // Step 2: Start transcription
    const transcriptResponse = await fetch(
      `${ASSEMBLYAI_BASE_URL}/transcript`,
      {
        method: "POST",
        headers: {
          Authorization: ASSEMBLYAI_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio_url: audioUrl,
          speech_model: "universal",
          language_code: mapLanguageCode(language),
          punctuate: true,
          format_text: true,
          speaker_labels: false,
          auto_highlights: false,
          content_safety: false,
          iab_categories: false,
          auto_chapters: false,
          entity_detection: false,
          sentiment_analysis: false,
          disfluencies: false,
          filter_profanity: false,
          boost_param: "low",
        }),
      }
    );

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      console.error("Transcription start error:", errorText);
      return NextResponse.json(
        { error: `Transcription start failed: ${transcriptResponse.status}` },
        { status: transcriptResponse.status }
      );
    }

    const transcriptResult = await transcriptResponse.json();
    const transcriptId = transcriptResult.id;

    // Step 3: Poll for completion
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      const pollResponse = await fetch(
        `${ASSEMBLYAI_BASE_URL}/transcript/${transcriptId}`,
        {
          headers: {
            Authorization: ASSEMBLYAI_API_KEY,
          },
        }
      );

      if (!pollResponse.ok) {
        return NextResponse.json(
          { error: `Poll failed: ${pollResponse.status}` },
          { status: pollResponse.status }
        );
      }

      const transcriptionResult = await pollResponse.json();

      if (transcriptionResult.status === "completed") {
        // Convert to subtitle format
        const segments = convertToSubtitles(
          transcriptionResult,
          "api-transcript",
          language
        );

        return NextResponse.json({
          segments,
          language,
          duration: calculateDuration(segments),
          confidence: calculateAverageConfidence(segments),
        });
      } else if (transcriptionResult.status === "error") {
        return NextResponse.json(
          { error: `Transcription failed: ${transcriptionResult.error}` },
          { status: 500 }
        );
      }

      // Wait 5 seconds before next poll
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }

    return NextResponse.json(
      { error: "Transcription timeout" },
      { status: 408 }
    );
  } catch (error) {
    console.error("Transcription API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function mapLanguageCode(language: string): string {
  const languageMap: { [key: string]: string } = {
    en: "en_us",
    zh: "zh",
    es: "es",
    fr: "fr",
    de: "de",
    it: "it",
    pt: "pt",
    ru: "ru",
    ja: "ja",
    ko: "ko",
  };

  return languageMap[language.toLowerCase()] || "en_us";
}

function convertToSubtitles(
  transcript: any,
  videoId: string,
  language: string
): any[] {
  const segments: any[] = [];

  if (transcript.utterances && Array.isArray(transcript.utterances)) {
    // Process utterances with timestamps - these are already well-segmented
    transcript.utterances.forEach((utterance: any, index: number) => {
      if (utterance.text && utterance.text.trim()) {
        const segment = {
          id: `${videoId}_segment_${index}`,
          text: utterance.text.trim(),
          start: utterance.start / 1000, // Convert from milliseconds to seconds
          end: utterance.end / 1000,
          confidence: utterance.confidence || 0.9,
          language,
          videoId,
        };
        segments.push(segment);
      }
    });
  } else if (transcript.words && Array.isArray(transcript.words)) {
    // Enhanced smart segmentation with better voice detection
    let currentSegment: any = null;
    let wordCount = 0;
    let lastWordTime = 0;
    let consecutiveSilence = 0;

    // 优化参数 - 针对背景音和更自然的分段
    const maxWordsPerSegment = 25; // 增加单词数，减少过度分段
    const maxSegmentDuration = 12; // 增加最大时长，适应更长的句子
    const silenceThreshold = 2.0; // 增加静音阈值，避免背景音干扰
    const minSegmentDuration = 2.0; // 最小段时长，避免过短分段
    const maxConsecutiveSilence = 3; // 连续静音次数阈值

    transcript.words.forEach((word: any, index: number) => {
      const wordStart = word.start / 1000;
      const wordEnd = word.end / 1000;

      // 计算时间间隔
      const timeSinceLastWord = wordStart - lastWordTime;

      // 检测连续静音 - 用于处理背景音
      if (timeSinceLastWord > 0.5) {
        // 0.5秒以上算静音
        consecutiveSilence++;
      } else {
        consecutiveSilence = 0;
      }

      // 智能分段检测 - 考虑背景音干扰
      const isLongSilence = timeSinceLastWord > silenceThreshold;
      const isSentenceEnd = word.text.match(/[.!?]$/);
      const isNewSentence =
        word.text.match(/^[A-Z]/) && timeSinceLastWord > 1.0;
      const isExcessiveSilence = consecutiveSilence >= maxConsecutiveSilence;

      // 综合判断是否应该分段
      const isNaturalBreak =
        isLongSilence || isSentenceEnd || isNewSentence || isExcessiveSilence;

      if (!currentSegment) {
        // 开始新段落
        currentSegment = {
          id: `${videoId}_segment_${segments.length}`,
          text: word.text,
          start: wordStart,
          end: wordEnd,
          confidence: word.confidence || 0.9,
          language,
          videoId,
        };
        wordCount = 1;
        lastWordTime = wordEnd;
      } else {
        // 检查是否应该开始新段落
        const segmentDuration = wordEnd - currentSegment.start;
        const shouldBreak =
          (isNaturalBreak && segmentDuration >= minSegmentDuration) ||
          wordCount >= maxWordsPerSegment ||
          segmentDuration >= maxSegmentDuration ||
          index === transcript.words.length - 1;

        if (shouldBreak && wordCount > 0) {
          // 完成当前段落
          segments.push(currentSegment);

          // 开始新段落
          currentSegment = {
            id: `${videoId}_segment_${segments.length}`,
            text: word.text,
            start: wordStart,
            end: wordEnd,
            confidence: word.confidence || 0.9,
            language,
            videoId,
          };
          wordCount = 1;
        } else {
          // 继续当前段落
          currentSegment.text += " " + word.text;
          currentSegment.end = wordEnd;
          currentSegment.confidence = Math.min(
            currentSegment.confidence,
            word.confidence || 0.9
          );
          wordCount++;
        }
        lastWordTime = wordEnd;
      }
    });

    // 添加最后一个段落
    if (currentSegment && wordCount > 0) {
      segments.push(currentSegment);
    }
  } else if (transcript.text) {
    // Fallback: split text into sentences for better segmentation
    const sentences: string[] = transcript.text
      .trim()
      .split(/(?<=[.!?])\s+/)
      .filter((sentence: string) => sentence.trim().length > 0);

    sentences.forEach((sentence: string, index: number) => {
      const segment = {
        id: `${videoId}_segment_${index}`,
        text: sentence.trim(),
        start: index * 5, // Approximate timing
        end: (index + 1) * 5,
        confidence: 0.9,
        language,
        videoId,
      };
      segments.push(segment);
    });
  }

  return segments;
}

function calculateDuration(segments: any[]): number {
  if (segments.length === 0) return 0;
  return Math.max(...segments.map((s) => s.end));
}

function calculateAverageConfidence(segments: any[]): number {
  if (segments.length === 0) return 0;
  const total = segments.reduce((sum, segment) => sum + segment.confidence, 0);
  return total / segments.length;
}
