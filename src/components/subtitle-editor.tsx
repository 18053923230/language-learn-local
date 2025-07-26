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
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const parseTime = (timeString: string) => {
    const parts = timeString.split(":");
    if (parts.length === 2) {
      const mins = parseInt(parts[0]) || 0;
      const secs = parseInt(parts[1]) || 0;
      return mins * 60 + secs;
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

  const handlePlaySegment = () => {
    onPlaySegment?.(editedSubtitle.start, editedSubtitle.end);
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Edit Subtitle</h3>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Time Range */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Time Range:</span>
          </div>
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                value={formatTime(editedSubtitle.start)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleTimeChange("start", e.target.value)
                }
                className="w-20 text-center"
                placeholder="0:00"
              />
              <span>-</span>
              <Input
                type="text"
                value={formatTime(editedSubtitle.end)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleTimeChange("end", e.target.value)
                }
                className="w-20 text-center"
                placeholder="0:00"
              />
            </div>
          ) : (
            <span className="text-sm text-gray-600">
              {formatTime(subtitle.start)} - {formatTime(subtitle.end)}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlaySegment}
            className="text-blue-600 hover:text-blue-700"
          >
            <Play className="w-4 h-4 mr-1" />
            Play
          </Button>
        </div>

        {/* Confidence */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Confidence:</span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              subtitle.confidence > 0.8
                ? "bg-green-100 text-green-800"
                : subtitle.confidence > 0.6
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {Math.round(subtitle.confidence * 100)}%
          </span>
        </div>

        {/* Text Content */}
        <div>
          <label className="text-sm font-medium block mb-2">Text:</label>
          {isEditing ? (
            <Textarea
              value={editedSubtitle.text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setEditedSubtitle((prev) => ({
                  ...prev,
                  text: e.target.value,
                }))
              }
              rows={3}
              className="w-full"
              placeholder="Enter subtitle text..."
            />
          ) : (
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
              {subtitle.text}
            </p>
          )}
        </div>

        {/* Language */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Language:</span>
          <span className="text-sm text-gray-600">{subtitle.language}</span>
        </div>
      </div>
    </div>
  );
}
