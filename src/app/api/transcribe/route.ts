import { NextRequest, NextResponse } from "next/server";
import { Subtitle } from "@/types/subtitle";

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
  transcript: Record<string, unknown>,
  videoId: string,
  language: string
): Subtitle[] {
  const segments: Subtitle[] = [];

  if (transcript.utterances && Array.isArray(transcript.utterances)) {
    // 对utterances进行智能合并，基于标点和语义
    let currentSegment: Subtitle | null = null;
    let currentText = "";
    let segmentEnd = 0;
    let segmentConfidence = 1.0;

    transcript.utterances.forEach((utterance: Record<string, unknown>) => {
      if (
        !utterance.text ||
        typeof utterance.text !== "string" ||
        !utterance.text.trim()
      )
        return;

      const utteranceText = utterance.text.trim();
      const utteranceStart = (utterance.start as number) / 1000;
      const utteranceEnd = (utterance.end as number) / 1000;
      const utteranceConfidence = (utterance.confidence as number) || 0.9;

      // 如果是第一个utterance，初始化段落
      if (!currentSegment) {
        currentSegment = {
          id: `${videoId}_segment_${segments.length}`,
          text: utteranceText,
          start: utteranceStart,
          end: utteranceEnd,
          confidence: utteranceConfidence,
          language,
          videoId,
        };
        currentText = utteranceText;
        segmentEnd = utteranceEnd;
        segmentConfidence = utteranceConfidence;
      } else {
        // 检查是否应该分段
        const shouldBreak = shouldBreakUtterance(
          utteranceText,
          currentText,
          utteranceStart,
          segmentEnd
        );

        if (shouldBreak && currentText.trim()) {
          // 完成当前段落
          currentSegment.text = currentText.trim();
          currentSegment.end = segmentEnd;
          currentSegment.confidence = segmentConfidence;
          segments.push(currentSegment);

          // 开始新段落
          currentSegment = {
            id: `${videoId}_segment_${segments.length}`,
            text: utteranceText,
            start: utteranceStart,
            end: utteranceEnd,
            confidence: utteranceConfidence,
            language,
            videoId,
          };
          currentText = utteranceText;
          segmentEnd = utteranceEnd;
          segmentConfidence = utteranceConfidence;
        } else {
          // 继续当前段落
          currentText += " " + utteranceText;
          segmentEnd = utteranceEnd;
          segmentConfidence = Math.min(segmentConfidence, utteranceConfidence);
        }
      }
    });

    // 添加最后一个段落
    if (currentSegment && currentText.trim()) {
      currentSegment.text = currentText.trim();
      currentSegment.end = segmentEnd;
      currentSegment.confidence = segmentConfidence;
      segments.push(currentSegment);
    }
  } else if (transcript.words && Array.isArray(transcript.words)) {
    // 基于标点的智能分段算法
    let currentSegment: Subtitle | null = null;
    let currentText = "";
    let segmentStart = 0;
    let segmentEnd = 0;
    let segmentConfidence = 1.0;

    transcript.words.forEach((word: Record<string, unknown>, index: number) => {
      const wordStart = (word.start as number) / 1000;
      const wordEnd = (word.end as number) / 1000;
      const wordText = word.text as string;
      const wordConfidence = (word.confidence as number) || 0.9;

      // 如果是第一个单词，初始化段落
      if (!currentSegment) {
        currentSegment = {
          id: `${videoId}_segment_${segments.length}`,
          text: wordText,
          start: wordStart,
          end: wordEnd,
          confidence: wordConfidence,
          language,
          videoId,
        };
        currentText = wordText;
        segmentStart = wordStart;
        segmentEnd = wordEnd;
        segmentConfidence = wordConfidence;
      } else {
        // 检查是否应该分段
        const shouldBreak = shouldBreakSegment(
          wordText,
          index,
          transcript.words as Record<string, unknown>[]
        );

        if (shouldBreak && currentText.trim()) {
          // 完成当前段落
          currentSegment.text = currentText.trim();
          currentSegment.end = segmentEnd;
          currentSegment.confidence = segmentConfidence;
          segments.push(currentSegment);

          // 开始新段落
          currentSegment = {
            id: `${videoId}_segment_${segments.length}`,
            text: wordText,
            start: wordStart,
            end: wordEnd,
            confidence: wordConfidence,
            language,
            videoId,
          };
          currentText = wordText;
          segmentStart = wordStart;
          segmentEnd = wordEnd;
          segmentConfidence = wordConfidence;
        } else {
          // 继续当前段落
          currentText += " " + wordText;
          segmentEnd = wordEnd;
          segmentConfidence = Math.min(segmentConfidence, wordConfidence);
        }
      }
    });

    // 添加最后一个段落
    if (currentSegment && currentText.trim()) {
      currentSegment.text = currentText.trim();
      currentSegment.end = segmentEnd;
      currentSegment.confidence = segmentConfidence;
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

// 判断是否应该分段的辅助函数（用于words）
function shouldBreakSegment(
  wordText: string,
  wordIndex: number,
  allWords: Record<string, unknown>[]
): boolean {
  // 1. 句末标点：句号、感叹号、问号
  if (wordText.match(/[.!?]$/)) {
    return true;
  }

  // 2. 段落标点：冒号、分号（在适当长度后）
  if (wordText.match(/[:;]$/) && wordIndex > 5) {
    return true;
  }

  // 3. 逗号后的长停顿（超过1.5秒）
  if (wordText.match(/,$/) && wordIndex < allWords.length - 1) {
    const nextWord = allWords[wordIndex + 1];
    const timeGap =
      ((nextWord.start as number) - (allWords[wordIndex].end as number)) / 1000;
    if (timeGap > 1.5) {
      return true;
    }
  }

  // 4. 新句子开始（大写字母开头且前面有足够停顿）
  if (wordText.match(/^[A-Z]/) && wordIndex > 0) {
    const prevWord = allWords[wordIndex - 1];
    const timeGap =
      ((allWords[wordIndex].start as number) - (prevWord.end as number)) / 1000;
    if (timeGap > 1.0) {
      return true;
    }
  }

  // 5. 避免过长的段落（超过15个单词）
  const currentSegmentWords = allWords.slice(
    Math.max(0, wordIndex - 15),
    wordIndex + 1
  );
  const hasRecentBreak = currentSegmentWords.some(
    (word, idx) =>
      idx < currentSegmentWords.length - 1 &&
      (word.text as string).match(/[.!?]$/)
  );

  if (wordIndex > 15 && !hasRecentBreak) {
    return true;
  }

  return false;
}

// 判断是否应该分段的辅助函数（用于utterances）
function shouldBreakUtterance(
  utteranceText: string,
  currentText: string,
  utteranceStart: number,
  segmentEnd: number
): boolean {
  // 1. 句末标点：句号、感叹号、问号
  if (utteranceText.match(/[.!?]$/)) {
    return true;
  }

  // 2. 段落标点：冒号、分号
  if (utteranceText.match(/[:;]$/)) {
    return true;
  }

  // 3. 长停顿（超过2秒）
  const timeGap = utteranceStart - segmentEnd;
  if (timeGap > 2.0) {
    return true;
  }

  // 4. 新句子开始（大写字母开头）
  if (utteranceText.match(/^[A-Z]/) && timeGap > 0.5) {
    return true;
  }

  // 5. 避免过长的段落（超过50个字符或包含多个句子）
  const combinedText = currentText + " " + utteranceText;
  if (combinedText.length > 100) {
    return true;
  }

  // 6. 如果当前文本已经包含句末标点，开始新段落
  if (currentText.match(/[.!?]$/)) {
    return true;
  }

  return false;
}

function calculateDuration(segments: Subtitle[]): number {
  if (segments.length === 0) return 0;
  return Math.max(...segments.map((s) => s.end));
}

function calculateAverageConfidence(segments: Subtitle[]): number {
  if (segments.length === 0) return 0;
  const total = segments.reduce((sum, segment) => sum + segment.confidence, 0);
  return total / segments.length;
}
