export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: Meaning[];
  origin?: string;
  pronunciation?: string;
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

export interface Definition {
  definition: string;
  example?: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  definition: string;
  example?: string;
  partOfSpeech: string;
  language: string;
  addedAt: Date;
  lastReviewed?: Date;
  reviewCount: number;
  difficulty: "easy" | "medium" | "hard";
  notes?: string;
}

export class DictionaryAPI {
  private static readonly BASE_URL =
    "https://api.dictionaryapi.dev/api/v2/entries/en";

  static async lookupWord(
    word: string,
    language: string = "en"
  ): Promise<DictionaryEntry[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/${encodeURIComponent(word)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Word "${word}" not found`);
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.parseDictionaryResponse(data);
    } catch (error) {
      console.error("Dictionary API error:", error);
      throw error;
    }
  }

  private static parseDictionaryResponse(data: any[]): DictionaryEntry[] {
    return data.map((entry: any) => ({
      word: entry.word,
      phonetic: entry.phonetic,
      meanings: entry.meanings.map((meaning: any) => ({
        partOfSpeech: meaning.partOfSpeech,
        definitions: meaning.definitions.map((def: any) => ({
          definition: def.definition,
          example: def.example,
        })),
        synonyms: meaning.synonyms || [],
        antonyms: meaning.antonyms || [],
      })),
      origin: entry.origin,
      pronunciation: entry.phonetics?.[0]?.audio,
    }));
  }

  static async getWordSuggestions(partialWord: string): Promise<string[]> {
    // For now, return a simple suggestion based on common words
    // In a real implementation, you might use a more sophisticated approach
    const commonWords = [
      "hello",
      "world",
      "language",
      "learning",
      "video",
      "subtitle",
      "speech",
      "recognition",
      "transcription",
      "audio",
      "playback",
      "dictionary",
      "vocabulary",
      "pronunciation",
      "grammar",
      "sentence",
    ];

    return commonWords
      .filter((word) =>
        word.toLowerCase().startsWith(partialWord.toLowerCase())
      )
      .slice(0, 5);
  }

  static async getRandomWord(): Promise<string> {
    const words = [
      "serendipity",
      "ephemeral",
      "mellifluous",
      "petrichor",
      "aurora",
      "luminous",
      "ethereal",
      "resplendent",
      "tranquil",
      "serene",
    ];
    return words[Math.floor(Math.random() * words.length)];
  }

  // Text-to-Speech functionality (using browser's built-in speech synthesis)
  static speakWord(word: string, language: string = "en"): void {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = language;
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech synthesis not supported in this browser");
    }
  }

  // Stop speech synthesis
  static stopSpeaking(): void {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
  }

  // Get available voices
  static getAvailableVoices(): SpeechSynthesisVoice[] {
    if ("speechSynthesis" in window) {
      return speechSynthesis.getVoices();
    }
    return [];
  }

  // Extract words from text
  static extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates
  }

  // Calculate word difficulty based on various factors
  static calculateWordDifficulty(
    word: string,
    frequency?: number
  ): "easy" | "medium" | "hard" {
    const length = word.length;
    const hasComplexPatterns = /[aeiou]{3,}|[bcdfghjklmnpqrstvwxyz]{4,}/.test(
      word
    );

    if (length <= 4 || (frequency && frequency > 1000)) {
      return "easy";
    } else if (length <= 8 && !hasComplexPatterns) {
      return "medium";
    } else {
      return "hard";
    }
  }
}
