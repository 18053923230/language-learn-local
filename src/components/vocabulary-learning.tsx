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

interface VocabularyLearningProps {
  isEnglishVideo?: boolean;
  currentLanguage?: string;
}

export function VocabularyLearning({
  isEnglishVideo = true,
  currentLanguage = "en",
}: VocabularyLearningProps) {
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
    <div className="h-full flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">My Vocabulary</h2>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStats(!showStats)}
            className="education-button-secondary"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Stats
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("json")}
            className="education-button-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {showStats && (
        <div className="education-card p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-purple-600 text-xs">📊</span>
            </span>
            Learning Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Total Words
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {stats.easy}
              </div>
              <div className="text-sm text-gray-600 font-medium">Easy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {stats.medium}
              </div>
              <div className="text-sm text-gray-600 font-medium">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {stats.hard}
              </div>
              <div className="text-sm text-gray-600 font-medium">Hard</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 text-center">
            Reviewed today: {stats.reviewedToday} | Avg reviews:{" "}
            {stats.averageReviewCount}
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="space-y-4">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for a word..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="education-input pl-12 pr-4 py-3 text-lg"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="education-button px-6"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="education-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-blue-600 text-xs">🔍</span>
              </span>
              Search Results
            </h3>
            <div className="space-y-4">
              {searchResults.map((entry, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-bold text-gray-900">
                        {entry.word}
                      </h4>
                      {entry.phonetic && (
                        <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                          [{entry.phonetic}]
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSpeak(entry.word)}
                        className="hover:bg-blue-100 text-blue-600"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddWord(entry.word)}
                      disabled={vocabulary.some((v) => v.word === entry.word)}
                      className="education-button"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  {entry.meanings.map((meaning, mIndex) => (
                    <div key={mIndex} className="ml-2 mb-3 last:mb-0">
                      <div className="text-sm text-blue-600 font-medium mb-1">
                        {meaning.partOfSpeech}
                      </div>
                      <div className="text-gray-700 mb-2">
                        {meaning.definitions[0]?.definition}
                      </div>
                      {meaning.definitions[0]?.example && (
                        <div className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded-lg">
                          "{meaning.definitions[0].example}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="education-card p-4 bg-red-50 border-red-200">
            <div className="flex items-center space-x-2 text-red-700">
              <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xs">⚠️</span>
              </span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Vocabulary List */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-purple-600 text-xs">📚</span>
            </span>
            My Vocabulary ({vocabulary.length})
          </h3>
          {wordsForReview.length > 0 && (
            <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
              {wordsForReview.length} words need review
            </span>
          )}
        </div>

        {vocabulary.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No words added yet
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              Search for a word above to start building your vocabulary!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vocabulary.map((item) => (
              <div
                key={item.id}
                className={`education-card p-6 transition-all duration-200 hover:shadow-lg ${
                  wordsForReview.some((w) => w.id === item.id)
                    ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                    : "bg-white"
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-xl font-bold text-gray-900">
                        {item.word}
                      </h4>
                      <span className="text-sm text-gray-500 italic bg-gray-100 px-2 py-1 rounded">
                        {item.partOfSpeech}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSpeak(item.word)}
                        className="hover:bg-purple-100 text-purple-600"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-gray-700 mb-2 leading-relaxed line-clamp-2">
                      {item.definition}
                    </p>
                    {item.example && (
                      <p className="text-gray-600 italic bg-gray-50 p-3 rounded-lg mb-3 line-clamp-2">
                        "{item.example}"
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span>Reviews: {item.reviewCount}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span>Added: {formatDate(item.addedAt)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    {/* Difficulty Buttons */}
                    <div className="flex space-x-1">
                      <Button
                        variant={
                          item.difficulty === "easy" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleDifficultyChange(item.id, "easy")}
                        className={`text-xs px-3 py-1 h-8 flex-1 ${
                          item.difficulty === "easy"
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "border-green-200 text-green-600 hover:bg-green-50"
                        }`}
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
                        className={`text-xs px-3 py-1 h-8 flex-1 ${
                          item.difficulty === "medium"
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                        }`}
                      >
                        Med
                      </Button>
                      <Button
                        variant={
                          item.difficulty === "hard" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleDifficultyChange(item.id, "hard")}
                        className={`text-xs px-3 py-1 h-8 flex-1 ${
                          item.difficulty === "hard"
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "border-red-200 text-red-600 hover:bg-red-50"
                        }`}
                      >
                        Hard
                      </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReview(item.id)}
                        className="h-8 w-8 p-0 border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Clock className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeWord(item.id)}
                        className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        ×
                      </Button>
                    </div>

                    {/* Notes Section */}
                    {selectedWord === item.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Textarea
                          placeholder="Add your personal notes about this word..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          className="education-input mb-3"
                        />
                        <div className="flex space-x-3">
                          <Button
                            size="sm"
                            onClick={() => handleSaveNotes(item.id)}
                            className="education-button"
                          >
                            Save Notes
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedWord(null)}
                            className="education-button-secondary"
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
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        {item.notes ? "Edit Notes" : "Add Notes"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
