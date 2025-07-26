"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useVocabulary } from "@/hooks/use-vocabulary";
import { DictionaryAPI } from "@/lib/dictionary-api";
import {
  Search,
  Plus,
  Volume2,
  BookOpen,
  Star,
  Clock,
  TrendingUp,
  Download,
  Upload,
} from "lucide-react";

export function VocabularyLearning() {
  const {
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
    exportVocabulary,
  } = useVocabulary();

  // 安全的日期格式化函数
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "Unknown";
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return dateObj.toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [showStats, setShowStats] = useState(false);

  const stats = getStats();
  const wordsForReview = getWordsForReview();

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        await searchWord(searchTerm);
      } catch (error) {
        console.error("Search failed:", error);
      }
    }
  };

  const handleAddWord = async (word: string) => {
    try {
      await addWord(word);
      setSearchTerm("");
      setSelectedWord(null);
    } catch (error) {
      console.error("Failed to add word:", error);
    }
  };

  const handleSpeak = (word: string) => {
    DictionaryAPI.speakWord(word);
  };

  const handleReview = (wordId: string) => {
    reviewWord(wordId);
  };

  const handleDifficultyChange = (
    wordId: string,
    difficulty: "easy" | "medium" | "hard"
  ) => {
    updateWordDifficulty(wordId, difficulty);
  };

  const handleSaveNotes = (wordId: string) => {
    addNotes(wordId, notes);
    setNotes("");
  };

  const handleExport = (format: "json" | "csv") => {
    exportVocabulary(format);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Vocabulary Learning</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStats(!showStats)}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Stats
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("json")}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {showStats && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Learning Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-gray-600">Total Words</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.easy}
              </div>
              <div className="text-gray-600">Easy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.medium}
              </div>
              <div className="text-gray-600">Medium</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {stats.hard}
              </div>
              <div className="text-gray-600">Hard</div>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Reviewed today: {stats.reviewedToday} | Avg reviews:{" "}
            {stats.averageReviewCount}
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Search for a word..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="w-4 h-4 mr-1" />
            Search
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Search Results</h3>
            {searchResults.map((entry, index) => (
              <div key={index} className="border-b last:border-b-0 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-medium">{entry.word}</h4>
                    {entry.phonetic && (
                      <span className="text-gray-500">[{entry.phonetic}]</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSpeak(entry.word)}
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddWord(entry.word)}
                    disabled={vocabulary.some((v) => v.word === entry.word)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                {entry.meanings.map((meaning, mIndex) => (
                  <div key={mIndex} className="ml-4 mb-2">
                    <div className="text-sm text-gray-600 italic">
                      {meaning.partOfSpeech}
                    </div>
                    <div className="text-sm">
                      {meaning.definitions[0]?.definition}
                    </div>
                    {meaning.definitions[0]?.example && (
                      <div className="text-sm text-gray-500 mt-1">
                        Example: "{meaning.definitions[0].example}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Vocabulary List */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">My Vocabulary ({vocabulary.length})</h3>
          {wordsForReview.length > 0 && (
            <span className="text-sm text-blue-600">
              {wordsForReview.length} words need review
            </span>
          )}
        </div>

        {vocabulary.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No words added yet. Search for a word to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {vocabulary.map((item) => (
              <div
                key={item.id}
                className={`bg-white border rounded-lg p-3 ${
                  wordsForReview.some((w) => w.id === item.id)
                    ? "border-yellow-300 bg-yellow-50"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{item.word}</h4>
                      <span className="text-xs text-gray-500 italic">
                        {item.partOfSpeech}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSpeak(item.word)}
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      {item.definition}
                    </p>
                    {item.example && (
                      <p className="text-sm text-gray-500 italic">
                        "{item.example}"
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                      <span>Reviews: {item.reviewCount}</span>
                      <span>Added: {formatDate(item.addedAt)}</span>
                      {item.lastReviewed && (
                        <span>Last: {formatDate(item.lastReviewed)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 ml-2">
                    {/* Difficulty Buttons */}
                    <div className="flex space-x-1">
                      <Button
                        variant={
                          item.difficulty === "easy" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleDifficultyChange(item.id, "easy")}
                        className="text-xs px-2"
                      >
                        Easy
                      </Button>
                      <Button
                        variant={
                          item.difficulty === "medium" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          handleDifficultyChange(item.id, "medium")
                        }
                        className="text-xs px-2"
                      >
                        Med
                      </Button>
                      <Button
                        variant={
                          item.difficulty === "hard" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleDifficultyChange(item.id, "hard")}
                        className="text-xs px-2"
                      >
                        Hard
                      </Button>
                    </div>

                    {/* Review Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReview(item.id)}
                      className="text-blue-600"
                    >
                      <Clock className="w-3 h-3" />
                    </Button>

                    {/* Remove Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeWord(item.id)}
                      className="text-red-600"
                    >
                      ×
                    </Button>
                  </div>
                </div>

                {/* Notes Section */}
                {selectedWord === item.id && (
                  <div className="mt-3 pt-3 border-t">
                    <Textarea
                      placeholder="Add notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="mb-2"
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveNotes(item.id)}
                      >
                        Save Notes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWord(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Show Notes Button */}
                {!selectedWord && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedWord(item.id)}
                    className="mt-2"
                  >
                    {item.notes ? "Edit Notes" : "Add Notes"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
