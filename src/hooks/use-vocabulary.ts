import { useState, useEffect, useCallback } from "react";
import {
  VocabularyItem,
  DictionaryAPI,
  DictionaryEntry,
} from "@/lib/dictionary-api";
import { useAppStore } from "@/lib/store";

export interface VocabularyStats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  reviewedToday: number;
  averageReviewCount: number;
}

export function useVocabulary() {
  const { vocabulary, setVocabulary } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<DictionaryEntry[]>([]);

  // Add word to vocabulary
  const addWord = useCallback(
    async (word: string, language: string = "en") => {
      setLoading(true);
      setError(null);

      try {
        // Clean the word by removing punctuation marks
        const cleanWord = word.replace(/[.,!?;:'"()[\]{}]/g, "").trim();

        if (!cleanWord) {
          throw new Error("Invalid word after cleaning");
        }

        // Check if word already exists
        const existingWord = vocabulary.find(
          (item) =>
            item.word.toLowerCase() === cleanWord.toLowerCase() &&
            item.language === language
        );

        if (existingWord) {
          throw new Error("Word already exists in vocabulary");
        }

        // Look up word definition
        const dictionaryEntries = await DictionaryAPI.lookupWord(
          cleanWord,
          language
        );

        if (dictionaryEntries.length === 0) {
          throw new Error("Word not found in dictionary");
        }

        const entry = dictionaryEntries[0];
        const firstMeaning = entry.meanings[0];
        const firstDefinition = firstMeaning.definitions[0];

        const newVocabularyItem: VocabularyItem = {
          id: `${cleanWord}_${Date.now()}`,
          word: cleanWord.toLowerCase(),
          definition: firstDefinition.definition,
          example: firstDefinition.example,
          partOfSpeech: firstMeaning.partOfSpeech,
          language,
          addedAt: new Date(),
          reviewCount: 0,
          difficulty: DictionaryAPI.calculateWordDifficulty(cleanWord),
        };

        setVocabulary([...vocabulary, newVocabularyItem]);
        return newVocabularyItem;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add word";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [vocabulary, setVocabulary]
  );

  // Remove word from vocabulary
  const removeWord = useCallback(
    (wordId: string) => {
      const updatedVocabulary = vocabulary.filter((item) => item.id !== wordId);
      setVocabulary(updatedVocabulary);
    },
    [vocabulary, setVocabulary]
  );

  // Update word review
  const reviewWord = useCallback(
    (wordId: string) => {
      const updatedVocabulary = vocabulary.map((item) => {
        if (item.id === wordId) {
          return {
            ...item,
            lastReviewed: new Date(),
            reviewCount: item.reviewCount + 1,
          };
        }
        return item;
      });
      setVocabulary(updatedVocabulary);
    },
    [vocabulary, setVocabulary]
  );

  // Update word difficulty
  const updateWordDifficulty = useCallback(
    (wordId: string, difficulty: "easy" | "medium" | "hard") => {
      const updatedVocabulary = vocabulary.map((item) => {
        if (item.id === wordId) {
          return { ...item, difficulty };
        }
        return item;
      });
      setVocabulary(updatedVocabulary);
    },
    [vocabulary, setVocabulary]
  );

  // Add notes to word
  const addNotes = useCallback(
    (wordId: string, notes: string) => {
      const updatedVocabulary = vocabulary.map((item) => {
        if (item.id === wordId) {
          return { ...item, notes };
        }
        return item;
      });
      setVocabulary(updatedVocabulary);
    },
    [vocabulary, setVocabulary]
  );

  // Search word in dictionary
  const searchWord = useCallback(
    async (word: string, language: string = "en") => {
      setLoading(true);
      setError(null);

      try {
        const results = await DictionaryAPI.lookupWord(word, language);
        setSearchResults(results);
        return results;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to search word";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get vocabulary statistics
  const getStats = useCallback((): VocabularyStats => {
    const total = vocabulary.length;
    const easy = vocabulary.filter((item) => item.difficulty === "easy").length;
    const medium = vocabulary.filter(
      (item) => item.difficulty === "medium"
    ).length;
    const hard = vocabulary.filter((item) => item.difficulty === "hard").length;

    const today = new Date().toDateString();
    const reviewedToday = vocabulary.filter(
      (item) => item.lastReviewed && item.lastReviewed.toDateString() === today
    ).length;

    const averageReviewCount =
      total > 0
        ? vocabulary.reduce((sum, item) => sum + item.reviewCount, 0) / total
        : 0;

    return {
      total,
      easy,
      medium,
      hard,
      reviewedToday,
      averageReviewCount: Math.round(averageReviewCount * 10) / 10,
    };
  }, [vocabulary]);

  // Get words for review (not reviewed today)
  const getWordsForReview = useCallback(() => {
    const today = new Date().toDateString();
    return vocabulary.filter((item) => {
      if (!item.lastReviewed) return true;

      // 安全地处理日期
      try {
        const lastReviewedDate =
          typeof item.lastReviewed === "string"
            ? new Date(item.lastReviewed)
            : item.lastReviewed;
        return lastReviewedDate.toDateString() !== today;
      } catch (error) {
        return true; // 如果日期无效，认为需要复习
      }
    });
  }, [vocabulary]);

  // Get words by difficulty
  const getWordsByDifficulty = useCallback(
    (difficulty: "easy" | "medium" | "hard") => {
      return vocabulary.filter((item) => item.difficulty === difficulty);
    },
    [vocabulary]
  );

  // Get recently added words
  const getRecentWords = useCallback(
    (days: number = 7) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return vocabulary.filter((item) => {
        try {
          const addedAtDate =
            typeof item.addedAt === "string"
              ? new Date(item.addedAt)
              : item.addedAt;
          return addedAtDate > cutoffDate;
        } catch (error) {
          return false; // 如果日期无效，不包含在最近添加的单词中
        }
      });
    },
    [vocabulary]
  );

  // Export vocabulary
  const exportVocabulary = useCallback(
    (format: "json" | "csv" = "json") => {
      if (format === "json") {
        const dataStr = JSON.stringify(vocabulary, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `vocabulary_${
          new Date().toISOString().split("T")[0]
        }.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === "csv") {
        const headers = [
          "word",
          "definition",
          "partOfSpeech",
          "language",
          "difficulty",
          "reviewCount",
          "addedAt",
        ];
        const csvContent = [
          headers.join(","),
          ...vocabulary.map((item) => {
            try {
              const addedAtDate =
                typeof item.addedAt === "string"
                  ? new Date(item.addedAt)
                  : item.addedAt;
              return [
                item.word,
                `"${item.definition.replace(/"/g, '""')}"`,
                item.partOfSpeech,
                item.language,
                item.difficulty,
                item.reviewCount,
                addedAtDate.toISOString(),
              ].join(",");
            } catch (error) {
              return [
                item.word,
                `"${item.definition.replace(/"/g, '""')}"`,
                item.partOfSpeech,
                item.language,
                item.difficulty,
                item.reviewCount,
                new Date().toISOString(), // 使用当前日期作为后备
              ].join(",");
            }
          }),
        ].join("\n");

        const dataBlob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `vocabulary_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }
    },
    [vocabulary]
  );

  // Import vocabulary
  const importVocabulary = useCallback(
    (data: VocabularyItem[]) => {
      setVocabulary([...vocabulary, ...data]);
    },
    [vocabulary, setVocabulary]
  );

  return {
    vocabulary,
    loading,
    error,
    searchResults,
    addWord,
    removeWord,
    reviewWord,
    updateWordDifficulty,
    addNotes,
    searchWord,
    getStats,
    getWordsForReview,
    getWordsByDifficulty,
    getRecentWords,
    exportVocabulary,
    importVocabulary,
  };
}
