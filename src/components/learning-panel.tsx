"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Volume2, Plus, Settings, Play } from "lucide-react";
import { DictionaryAPI } from "@/lib/dictionary-api";

interface LearningPanelProps {
  onPlaySegment?: (start: number, end: number) => void;
  onAddToVocabulary?: (word: string, context: string) => void;
  isEnglishVideo?: boolean;
  currentLanguage?: string;
}

export function LearningPanel({
  onPlaySegment,
  onAddToVocabulary,
  isEnglishVideo = true,
  currentLanguage = "en",
}: LearningPanelProps) {
  const { currentSubtitle, playerState, vocabulary } = useAppStore();
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [wordData, setWordData] = useState<{
    definition: string;
    partOfSpeech: string;
    example?: string;
    phonetic?: string;
  } | null>(null);
  const [isLoadingWord, setIsLoadingWord] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatProgress, setRepeatProgress] = useState(0);
  const repeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleWordClick = (word: string) => {
    // 非英语视频完全禁用词典功能
    if (!isEnglishVideo) {
      return;
    }

    // Clean the word by removing punctuation marks
    const cleanWord = word.replace(/[.,!?;:'"()[\]{}]/g, "").trim();

    if (!cleanWord) {
      return; // Don't process empty words
    }

    setSelectedWord(cleanWord);
    setWordData(null);
    setIsLoadingWord(true);
  };

  // 获取单词数据（仅英语视频）
  useEffect(() => {
    const fetchWordData = async () => {
      if (!selectedWord || !isEnglishVideo) {
        setWordData(null);
        setIsLoadingWord(false);
        return;
      }

      // 仅英语视频使用词典API
      try {
        setIsLoadingWord(true);
        const entries = await DictionaryAPI.lookupWord(selectedWord);

        if (entries.length > 0) {
          const entry = entries[0];
          const firstMeaning = entry.meanings[0];
          const firstDefinition = firstMeaning.definitions[0];

          setWordData({
            definition: firstDefinition.definition,
            partOfSpeech: firstMeaning.partOfSpeech,
            example: firstDefinition.example,
            phonetic: entry.phonetic,
          });
        } else {
          setWordData({
            definition: "Definition not found",
            partOfSpeech: "Unknown",
          });
        }
      } catch (error) {
        console.error("Failed to fetch word data:", error);
        setWordData({
          definition: "Failed to load definition",
          partOfSpeech: "Unknown",
        });
      } finally {
        setIsLoadingWord(false);
      }
    };

    fetchWordData();
  }, [selectedWord, isEnglishVideo]);

  const handlePlaySegment = () => {
    if (currentSubtitle && onPlaySegment) {
      if (isRepeating) {
        startRepeatPlayback();
      } else {
        onPlaySegment(currentSubtitle.start, currentSubtitle.end);
      }
    }
  };

  const startRepeatPlayback = () => {
    if (!currentSubtitle || !onPlaySegment) return;

    setIsRepeating(true);
    setRepeatProgress(0);
    let currentRepeat = 0;

    const playNextRepeat = () => {
      if (currentRepeat < 3) {
        // Fixed repeat count to 3
        currentRepeat++;
        setRepeatProgress(currentRepeat);
        onPlaySegment(currentSubtitle.start, currentSubtitle.end);

        // 计算下一轮播放的延迟时间
        const segmentDuration =
          (currentSubtitle.end - currentSubtitle.start) * 1000;
        const delay = segmentDuration + 500; // 额外500ms间隔

        repeatTimerRef.current = setTimeout(playNextRepeat, delay);
      } else {
        // 循环播放完成
        setIsRepeating(false);
        setRepeatProgress(0);
      }
    };

    // 开始第一轮播放
    playNextRepeat();
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (repeatTimerRef.current) {
        clearTimeout(repeatTimerRef.current);
      }
    };
  }, []);

  const handleAddToVocabulary = () => {
    if (selectedWord && currentSubtitle && onAddToVocabulary) {
      onAddToVocabulary(selectedWord, currentSubtitle.text);
      setSelectedWord("");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
  };

  const splitTextIntoWords = (text: string) => {
    return text.split(/\s+/).filter((word) => word.length > 0);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
              <span className="text-white text-sm font-bold">🎯</span>
            </span>
            Learning Tools
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-white/50 rounded-full"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Current Subtitle Learning */}
        {currentSubtitle && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-mono">
                  {formatTime(currentSubtitle.start)} -{" "}
                  {formatTime(currentSubtitle.end)}
                </span>
                {currentSubtitle.confidence && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      currentSubtitle.confidence > 0.8
                        ? "bg-green-100 text-green-700"
                        : currentSubtitle.confidence > 0.6
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {Math.round(currentSubtitle.confidence * 100)}% confidence
                  </span>
                )}
              </div>
              <div className="text-sm leading-relaxed bg-white p-3 rounded-lg border border-blue-200">
                {splitTextIntoWords(currentSubtitle.text).map((word, index) => (
                  <span
                    key={index}
                    className={`cursor-pointer hover:bg-blue-100 rounded px-1 transition-colors ${
                      selectedWord === word ? "bg-blue-200" : ""
                    }`}
                    onClick={() => handleWordClick(word)}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Playback Controls */}
        <div className="space-y-4">
          <div className="space-y-4">
            <Button
              onClick={handlePlaySegment}
              disabled={!currentSubtitle || isRepeating}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isRepeating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Repeating ({repeatProgress}/3)
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Play Segment
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Word Learning - Only for English videos */}
        {selectedWord && isEnglishVideo && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-purple-900 text-lg">
                      {selectedWord}
                    </span>
                    {wordData?.phonetic && (
                      <span className="text-sm text-gray-600 font-mono">
                        /{wordData.phonetic}/
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (selectedWord) {
                        DictionaryAPI.speakWord(selectedWord);
                      }
                    }}
                    className="hover:bg-purple-100"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-sm text-purple-800 space-y-2">
                  {isLoadingWord ? (
                    <>
                      <p>
                        <span className="font-medium">Definition:</span>{" "}
                        <span className="text-gray-600">Loading...</span>
                      </p>
                      <p>
                        <span className="font-medium">Part of Speech:</span>{" "}
                        <span className="text-gray-600">Loading...</span>
                      </p>
                    </>
                  ) : wordData ? (
                    <>
                      <p>
                        <span className="font-medium">Definition:</span>{" "}
                        <span className="text-gray-600">
                          {wordData.definition}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Part of Speech:</span>{" "}
                        <span className="text-gray-600">
                          {wordData.partOfSpeech}
                        </span>
                      </p>
                      {wordData.example && (
                        <p>
                          <span className="font-medium">Example:</span>{" "}
                          <span className="text-gray-600 italic">
                            &quot;{wordData.example}&quot;
                          </span>
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p>
                        <span className="font-medium">Definition:</span>{" "}
                        <span className="text-gray-600">
                          Click a word to see definition
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Part of Speech:</span>{" "}
                        <span className="text-gray-600">-</span>
                      </p>
                    </>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleAddToVocabulary}
                className="w-full h-10 bg-white border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700 font-medium rounded-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Vocabulary
              </Button>
            </div>
          </div>
        )}

        {/* Non-English Video Notice */}
        {!isEnglishVideo && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">ℹ</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-800">
                  Dictionary Feature
                </h4>
                <p className="text-xs text-blue-700 mt-1">
                  Dictionary lookup is only available for English videos. For{" "}
                  {currentLanguage} videos, please use external translation
                  tools.
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  <strong>Need online translation?</strong> Contact me at{" "}
                  <a
                    href="mailto:260316514@qq.com"
                    className="underline hover:text-blue-800"
                  >
                    260316514@qq.com
                  </a>
                  . I&apos;m only familiar with Chinese and English. If there
                  are 100+ requests for other languages, I&apos;ll develop this
                  feature.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
