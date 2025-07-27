"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { VocabularyItem } from "@/types/vocabulary";
import { Button } from "@/components/ui/button";

export function VocabularyManager() {
  const { vocabulary, removeVocabularyItem, updateVocabularyItem } =
    useAppStore();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const filteredVocabulary =
    selectedDifficulty === "all"
      ? vocabulary
      : vocabulary.filter((item) => item.difficulty === selectedDifficulty);

  const handleRemoveItem = (id: string) => {
    removeVocabularyItem(id);
  };

  const handleUpdateDifficulty = (
    id: string,
    difficulty: VocabularyItem["difficulty"]
  ) => {
    updateVocabularyItem(id, { difficulty });
  };

  return (
    <div className="space-y-6">
      {/* 筛选器 */}
      <div className="flex gap-2">
        <Button
          variant={selectedDifficulty === "all" ? "default" : "outline"}
          onClick={() => setSelectedDifficulty("all")}
        >
          All ({vocabulary.length})
        </Button>
        <Button
          variant={selectedDifficulty === "easy" ? "default" : "outline"}
          onClick={() => setSelectedDifficulty("easy")}
        >
          Easy ({vocabulary.filter((v) => v.difficulty === "easy").length})
        </Button>
        <Button
          variant={selectedDifficulty === "medium" ? "default" : "outline"}
          onClick={() => setSelectedDifficulty("medium")}
        >
          Medium ({vocabulary.filter((v) => v.difficulty === "medium").length})
        </Button>
        <Button
          variant={selectedDifficulty === "hard" ? "default" : "outline"}
          onClick={() => setSelectedDifficulty("hard")}
        >
          Hard ({vocabulary.filter((v) => v.difficulty === "hard").length})
        </Button>
      </div>

      {/* 词汇列表 */}
      <div className="space-y-4">
        {filteredVocabulary.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No vocabulary items found.
          </div>
        ) : (
          filteredVocabulary.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{item.word}</h3>
                  <p className="text-sm text-gray-600">{item.pronunciation}</p>
                  <p className="text-sm text-gray-500">{item.partOfSpeech}</p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={item.difficulty}
                    onChange={(e) =>
                      handleUpdateDifficulty(
                        item.id,
                        e.target.value as VocabularyItem["difficulty"]
                      )
                    }
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <p className="text-gray-700">{item.definition}</p>
              {item.example && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Example:</p>
                  <p className="text-sm text-gray-700">{item.example}</p>
                </div>
              )}
              <div className="text-xs text-gray-500">
                Added: {new Date(item.addedAt).toLocaleDateString()} | Reviews:{" "}
                {item.reviewCount}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
