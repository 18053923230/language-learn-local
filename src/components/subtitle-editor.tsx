"use client";

import { useState, useEffect } from "react";
import { Subtitle } from "@/types/subtitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import {
  Edit,
  Save,
  X,
  Clock,
  Play,
  Volume2,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface SubtitleEditorProps {
  subtitle: Subtitle;
  onSave: (subtitle: Subtitle) => void;
  onCancel: () => void;
  onPlaySegment?: (start: number, end: number) => void;
}

export function SubtitleEditor({
  subtitle,
  onSave,
  onCancel,
  onPlaySegment,
}: SubtitleEditorProps) {
  const [editedSubtitle, setEditedSubtitle] = useState<Subtitle>(subtitle);
  const [isEditing, setIsEditing] = useState(false);
  const { setCurrentSubtitle } = useAppStore();

  useEffect(() => {
    setEditedSubtitle(subtitle);
  }, [subtitle]);

  const handleSave = () => {
    onSave(editedSubtitle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSubtitle(subtitle);
    setIsEditing(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
  };

  const parseTime = (timeString: string) => {
    // Support both "M:SS" and "M:SS.mmm" formats
    const parts = timeString.split(":");
    if (parts.length === 2) {
      const mins = parseInt(parts[0]) || 0;
      const secsPart = parts[1];

      // Check if seconds part contains milliseconds
      if (secsPart.includes(".")) {
        const [secs, ms] = secsPart.split(".");
        const seconds = parseInt(secs) || 0;
        const milliseconds = parseInt(ms.padEnd(3, "0")) || 0;
        return mins * 60 + seconds + milliseconds / 1000;
      } else {
        const seconds = parseInt(secsPart) || 0;
        return mins * 60 + seconds;
      }
    }
    return 0;
  };

  const handleTimeChange = (field: "start" | "end", value: string) => {
    const time = parseTime(value);
    setEditedSubtitle((prev) => ({
      ...prev,
      [field]: time,
    }));
  };

  const handleTimeAdjust = (field: "start" | "end", adjustment: number) => {
    setEditedSubtitle((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] + adjustment),
    }));
  };

  const handlePlaySegment = () => {
    onPlaySegment?.(editedSubtitle.start, editedSubtitle.end);
  };

  return (
    <div className="education-card p-6 shadow-xl border-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Edit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Edit Subtitle</h3>
            {/* <p className="text-sm text-gray-500">
              Fine-tune timing and content
            </p> */}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="education-button"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <>
              <Button onClick={handleSave} className="education-button">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              {/* <Button
                variant="outline"
                onClick={handleCancel}
                className="education-button-secondary"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button> */}
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Time Range Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Time Range</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlaySegment}
              className="ml-auto text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              <Play className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              {/* Start Time */}
              <div className="flex items-center space-x-3">
                {/* <span className="text-sm font-medium text-gray-700 w-16">
                  Start:
                </span> */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTimeAdjust("start", -0.1)}
                    className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
                    title="Decrease by 0.1 seconds"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Input
                    type="text"
                    value={formatTime(editedSubtitle.start)}
                    onChange={(e) => handleTimeChange("start", e.target.value)}
                    className="w-24 text-center font-mono text-lg"
                    placeholder="0:00.000"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTimeAdjust("start", 0.1)}
                    className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
                    title="Increase by 0.1 seconds"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* End Time */}
              <div className="flex items-center space-x-3">
                {/* <span className="text-sm font-medium text-gray-700 w-16">
                  End:
                </span> */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTimeAdjust("end", -0.1)}
                    className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
                    title="Decrease by 0.1 seconds"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Input
                    type="text"
                    value={formatTime(editedSubtitle.end)}
                    onChange={(e) => handleTimeChange("end", e.target.value)}
                    className="w-24 text-center font-mono text-lg"
                    placeholder="0:00.000"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTimeAdjust("end", 0.1)}
                    className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
                    title="Increase by 0.1 seconds"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                💡 Click the arrows to adjust time by ±0.1 seconds (millisecond
                precision)
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {/* <span className="text-sm font-medium text-gray-700">
                  Start:
                </span> */}
                <span className="text-lg font-mono text-gray-900 bg-white px-3 py-1 rounded border">
                  {formatTime(subtitle.start)}
                </span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex items-center space-x-2">
                {/* <span className="text-sm font-medium text-gray-700">End:</span> */}
                <span className="text-lg font-mono text-gray-900 bg-white px-3 py-1 rounded border">
                  {formatTime(subtitle.end)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confidence Section */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">Confidence:</span>
          <div className="flex items-center space-x-2">
            {subtitle.confidence > 0.8 ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            )}
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                subtitle.confidence > 0.8
                  ? "bg-green-100 text-green-700"
                  : subtitle.confidence > 0.6
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {Math.round(subtitle.confidence * 100)}%
            </span>
          </div>
        </div>

        {/* Text Content Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center space-x-3 mb-4">
            <Volume2 className="w-5 h-5 text-purple-600" />
            <h4 className="text-lg font-semibold text-gray-900">Content</h4>
          </div>

          {isEditing ? (
            <Textarea
              value={editedSubtitle.text}
              onChange={(e) =>
                setEditedSubtitle((prev) => ({
                  ...prev,
                  text: e.target.value,
                }))
              }
              rows={4}
              className="education-input resize-none"
              placeholder="Enter subtitle text..."
            />
          ) : (
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <p className="text-gray-700 leading-relaxed">{subtitle.text}</p>
            </div>
          )}
        </div>

        {/* Language Section */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">Language:</span>
          <span className="education-badge education-badge-info">
            {subtitle.language}
          </span>
        </div>
      </div>
    </div>
  );
}
