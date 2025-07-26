"use client";

import { useState } from "react";
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

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    // TODO: Show word definition and pronunciation
  };

  const handlePlaySegment = () => {
    if (currentSubtitle && onPlaySegment) {
      onPlaySegment(currentSubtitle.start, currentSubtitle.end);
    }
  };

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
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              Play Segment
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement repeat functionality
              }}
            >
              <Repeat className="w-4 h-4" />
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
                <span className="font-medium text-blue-900">
                  {selectedWord}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement pronunciation
                  }}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-sm text-blue-800">
                <p className="mb-1">
                  <span className="font-medium">Definition:</span>
                  <span className="ml-1 text-gray-600">Loading...</span>
                </p>
                <p>
                  <span className="font-medium">Part of Speech:</span>
                  <span className="ml-1 text-gray-600">Loading...</span>
                </p>
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
