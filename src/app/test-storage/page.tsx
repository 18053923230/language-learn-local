"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { useVocabulary } from "@/hooks/use-vocabulary";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TestStoragePage() {
  const { vocabulary, setVocabulary } = useAppStore();
  const { addWord, removeWord } = useVocabulary();
  const [testWord, setTestWord] = useState("test");
  const [message, setMessage] = useState("");

  // 测试添加单词
  const handleAddTestWord = async () => {
    try {
      await addWord(testWord);
      setMessage(`Successfully added "${testWord}" to vocabulary`);
      setTestWord("");
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // 测试删除单词
  const handleRemoveWord = (wordId: string) => {
    removeWord(wordId);
    setMessage("Word removed from vocabulary");
  };

  // 清空词汇表
  const handleClearVocabulary = () => {
    setVocabulary([]);
    setMessage("Vocabulary cleared");
  };

  // 检查localStorage
  const checkLocalStorage = () => {
    const stored = localStorage.getItem("language-learning-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      setMessage(`LocalStorage contains: ${JSON.stringify(parsed, null, 2)}`);
    } else {
      setMessage("No data found in localStorage");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Storage Test Page
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Test Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Test Controls</h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={testWord}
                  onChange={(e) => setTestWord(e.target.value)}
                  placeholder="Enter test word"
                  className="px-3 py-2 border rounded-md"
                />
                <Button onClick={handleAddTestWord}>Add Word</Button>
              </div>

              <div className="flex space-x-2">
                <Button onClick={checkLocalStorage} variant="outline">
                  Check LocalStorage
                </Button>
                <Button onClick={handleClearVocabulary} variant="outline">
                  Clear Vocabulary
                </Button>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <pre className="text-sm text-blue-800 whitespace-pre-wrap">
                {message}
              </pre>
            </div>
          )}

          {/* Current Vocabulary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">
              Current Vocabulary ({vocabulary.length} words)
            </h2>

            {vocabulary.length === 0 ? (
              <p className="text-gray-500">No words in vocabulary</p>
            ) : (
              <div className="space-y-2">
                {vocabulary.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <span className="font-medium">{item.word}</span>
                      <span className="text-gray-500 ml-2">
                        ({item.partOfSpeech})
                      </span>
                      <p className="text-sm text-gray-600">{item.definition}</p>
                    </div>
                    <Button
                      onClick={() => handleRemoveWord(item.id)}
                      variant="outline"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">
              Test Instructions:
            </h3>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Add a test word using the input above</li>
              <li>Check that it appears in the vocabulary list</li>
              <li>Refresh the page (F5)</li>
              <li>Verify that the word is still there after refresh</li>
              <li>Use "Check LocalStorage" to see the raw data</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
