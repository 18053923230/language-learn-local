export interface VocabularyItem {
  id: string;
  word: string;
  definition: string;
  pronunciation: string;
  partOfSpeech: string;
  examples: string[];
  videoId: string;
  subtitleId: string;
  createdAt: Date;
  lastReviewed: Date;
  reviewCount: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface DictionaryResponse {
  word: string;
  phonetic: string;
  phonetics: Array<{
    text: string;
    audio: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example: string;
    }>;
  }>;
}
