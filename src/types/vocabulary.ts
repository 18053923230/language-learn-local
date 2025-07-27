export interface VocabularyItem {
  id: string;
  word: string;
  definition: string;
  example?: string;
  partOfSpeech: string;
  pronunciation?: string;
  language: string;
  addedAt: Date;
  lastReviewed?: Date;
  reviewCount: number;
  difficulty: "easy" | "medium" | "hard";
  notes?: string;
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
