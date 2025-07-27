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
    // Process utterances with timestamps
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
    // Process individual words and group them into segments
    let currentSegment: any = null;
    let wordCount = 0;
    const maxWordsPerSegment = 15;

    transcript.words.forEach((word: any, index: number) => {
      if (!currentSegment) {
        currentSegment = {
          id: `${videoId}_segment_${segments.length}`,
          text: word.text,
          start: word.start / 1000,
          end: word.end / 1000,
          confidence: word.confidence || 0.9,
          language,
          videoId,
        };
        wordCount = 1;
      } else {
        currentSegment.text += " " + word.text;
        currentSegment.end = word.end / 1000;
        currentSegment.confidence = Math.min(
          currentSegment.confidence,
          word.confidence || 0.9
        );
        wordCount++;
      }

      // Create new segment if we have enough words or reach the end
      if (
        wordCount >= maxWordsPerSegment ||
        index === transcript.words.length - 1
      ) {
        if (currentSegment) {
          segments.push(currentSegment);
          currentSegment = null;
          wordCount = 0;
        }
      }
    });
  } else if (transcript.text) {
    // Fallback: single text result
    const segment = {
      id: `${videoId}_segment_0`,
      text: transcript.text.trim(),
      start: 0,
      end: 30, // Default duration
      confidence: 0.9,
      language,
      videoId,
    };
    segments.push(segment);
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
