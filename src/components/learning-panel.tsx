"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Volume2,
  Repeat,
  Plus,
  Settings,
  Play,
  RotateCcw,
} from "lucide-react";
import { DictionaryAPI } from "@/lib/dictionary-api";

interface LearningPanelProps {
  onPlaySegment?: (start: number, end: number) => void;
  onAddToVocabulary?: (word: string, context: string) => void;
}

export function LearningPanel({
  onPlaySegment,
  onAddToVocabulary,
}: LearningPanelProps) {
  const { currentSubtitle, playerState, vocabulary } = useAppStore();
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [playbackMode, setPlaybackMode] = useState<
    "normal" | "repeat" | "slow"
  >("normal");
  const [repeatCount, setRepeatCount] = useState(3);
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
    setSelectedWord(word);
    setWordData(null);
    setIsLoadingWord(true);
  };

  // 获取单词数据
  useEffect(() => {
    const fetchWordData = async () => {
      if (!selectedWord) {
        setWordData(null);
        setIsLoadingWord(false);
        return;
      }

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
  }, [selectedWord]);

  const handlePlaySegment = () => {
    if (currentSubtitle && onPlaySegment) {
      if (playbackMode === "repeat" && !isRepeating) {
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
      if (currentRepeat < repeatCount) {
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

  const stopRepeatPlayback = () => {
    if (repeatTimerRef.current) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
    setIsRepeating(false);
    setRepeatProgress(0);
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
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const splitTextIntoWords = (text: string) => {
    return text.split(/\s+/).filter((word) => word.length > 0);
  };

  return (
    <div className="h-full flex flex-col bg-white border-l">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Learning Tools
          </h3>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Current Subtitle */}
      {currentSubtitle && (
        <div className="p-4 border-b">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-mono">
                {formatTime(currentSubtitle.start)} -{" "}
                {formatTime(currentSubtitle.end)}
              </span>
              {currentSubtitle.confidence && (
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    currentSubtitle.confidence > 0.8
                      ? "bg-green-100 text-green-800"
                      : currentSubtitle.confidence > 0.6
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {Math.round(currentSubtitle.confidence * 100)}% confidence
                </span>
              )}
            </div>

            <div className="text-sm leading-relaxed">
              {splitTextIntoWords(currentSubtitle.text).map((word, index) => (
                <span
                  key={index}
                  className={`cursor-pointer hover:bg-blue-100 rounded px-1 ${
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
      <div className="p-4 border-b">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Playback Controls
        </h4>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlaySegment}
              disabled={isRepeating}
              className="flex-1"
            >
              {isRepeating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  {repeatProgress}/{repeatCount}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play Segment
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={isRepeating ? stopRepeatPlayback : handlePlaySegment}
              className={
                isRepeating ? "bg-red-50 border-red-200 text-red-600" : ""
              }
            >
              {isRepeating ? (
                <RotateCcw className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-600">Playback Mode</label>
            <Select
              value={playbackMode}
              onValueChange={(value: "normal" | "repeat" | "slow") =>
                setPlaybackMode(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal Speed</SelectItem>
                <SelectItem value="slow">Slow Speed</SelectItem>
                <SelectItem value="repeat">Auto Repeat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {playbackMode === "repeat" && (
            <div className="space-y-2">
              <label className="text-xs text-gray-600">Repeat Count</label>
              <Select
                value={repeatCount.toString()}
                onValueChange={(value) => setRepeatCount(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 time</SelectItem>
                  <SelectItem value="3">3 times</SelectItem>
                  <SelectItem value="5">5 times</SelectItem>
                  <SelectItem value="10">10 times</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Word Learning */}
      {selectedWord && (
        <div className="p-4 border-b">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Word Learning
          </h4>

          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-blue-900">
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
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-sm text-blue-800">
                {isLoadingWord ? (
                  <>
                    <p className="mb-1">
                      <span className="font-medium">Definition:</span>
                      <span className="ml-1 text-gray-600">Loading...</span>
                    </p>
                    <p>
                      <span className="font-medium">Part of Speech:</span>
                      <span className="ml-1 text-gray-600">Loading...</span>
                    </p>
                  </>
                ) : wordData ? (
                  <>
                    <p className="mb-1">
                      <span className="font-medium">Definition:</span>
                      <span className="ml-1 text-gray-600">
                        {wordData.definition}
                      </span>
                    </p>
                    <p className="mb-1">
                      <span className="font-medium">Part of Speech:</span>
                      <span className="ml-1 text-gray-600">
                        {wordData.partOfSpeech}
                      </span>
                    </p>
                    {wordData.example && (
                      <p>
                        <span className="font-medium">Example:</span>
                        <span className="ml-1 text-gray-600 italic">
                          "{wordData.example}"
                        </span>
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="mb-1">
                      <span className="font-medium">Definition:</span>
                      <span className="ml-1 text-gray-600">
                        Click a word to see definition
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Part of Speech:</span>
                      <span className="ml-1 text-gray-600">-</span>
                    </p>
                  </>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToVocabulary}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Vocabulary
            </Button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="p-4 border-b">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Learning Progress
        </h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Vocabulary Items:</span>
            <span className="font-medium">{vocabulary.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Current Video:</span>
            <span className="font-medium">
              {playerState.currentTime > 0
                ? formatTime(playerState.currentTime)
                : "Not started"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Playback Speed:</span>
            <span className="font-medium">{playerState.playbackRate}x</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Quick Actions
        </h4>

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Implement export functionality
            }}
            className="w-full justify-start"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Export Vocabulary
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Implement reset functionality
            }}
            className="w-full justify-start"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Progress
          </Button>
        </div>
      </div>
    </div>
  );
}
