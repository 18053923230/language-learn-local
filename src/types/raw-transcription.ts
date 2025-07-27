export interface RawTranscriptionData {
  id: string;
  videoId: string;
  audioUrl: string;
  language: string;
  createdAt: Date;

  // AssemblyAI 原始响应
  assemblyData: {
    id: string;
    status: string;
    audio_url: string;
    text: string;
    words?: WordData[];
    utterances?: UtteranceData[];
    entities?: EntityData[];
    speakers?: SpeakerData[];
    confidence: number;
    audio_duration: number;
    disfluencies?: DisfluencyData[];
  };

  // 元数据
  metadata: {
    totalWords: number;
    totalUtterances: number;
    averageConfidence: number;
    processingTime: number;
    modelVersion: string;
    audioDuration: number;
  };
}

export interface WordData {
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: string;
  disfluency?: boolean;
  entity?: EntityData;
}

export interface UtteranceData {
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker: string;
  words?: WordData[];
}

export interface EntityData {
  text: string;
  entity_type: string;
  start: number;
  end: number;
}

export interface SpeakerData {
  speaker: string;
  confidence: number;
}

export interface DisfluencyData {
  text: string;
  start: number;
  end: number;
  type: string;
}
