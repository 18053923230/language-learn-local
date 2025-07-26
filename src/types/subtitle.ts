export interface Subtitle {
  id: string;
  text: string;
  start: number;
  end: number;
  confidence: number;
  language: string;
  videoId: string;
}

export interface SubtitleSegment {
  id: string;
  text: string;
  start: number;
  end: number;
  words: SubtitleWord[];
}

export interface SubtitleWord {
  id: string;
  text: string;
  start: number;
  end: number;
  confidence: number;
}
