import { NextRequest, NextResponse } from "next/server";
// import { RawTranscriptionData } from "@/types/raw-transcription";

const ASSEMBLYAI_API_KEY =
  process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY ||
  "2850bbdad3fa41c3b18735f524c20191";
const ASSEMBLYAI_BASE_URL = "https://api.assemblyai.com/v2";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

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
          format_text: false, // 不格式化，保持原始结构
          speaker_labels: true, // 获取说话人信息
          auto_highlights: false,
          content_safety: false,
          iab_categories: false,
          auto_chapters: false,
          entity_detection: true, // 实体识别
          sentiment_analysis: false,
          disfluencies: true, // 保留填充词和重复
          filter_profanity: false,
          boost_param: "low",
          speech_threshold: 0.0, // 不过滤任何语音
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
        // Return complete raw data for storage
        const rawData = {
          id: transcriptionResult.id,
          videoId: `api-transcript-${Date.now()}`,
          audioUrl: audioUrl,
          language: language,
          createdAt: new Date(),
          assemblyData: transcriptionResult,
          metadata: {
            totalWords: transcriptionResult.words?.length || 0,
            totalUtterances: transcriptionResult.utterances?.length || 0,
            averageConfidence: transcriptionResult.confidence || 0,
            processingTime: Date.now() - startTime,
            modelVersion: "universal",
            audioDuration: transcriptionResult.audio_duration || 0,
            fileName: audioFile.name,
            fileSize: audioFile.size,
          },
        };

        return NextResponse.json({
          rawData,
          success: true,
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
