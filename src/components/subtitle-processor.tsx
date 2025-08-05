"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Mic, AlertCircle, CheckCircle } from "lucide-react";
import { Subtitle } from "@/types/subtitle";

const SUPPORTED_SUBTITLE_FORMATS = ["srt", "vtt", "txt", "json"];

interface SubtitleProcessorProps {
  videoId: string;
  language: string;
  onSubtitlesLoaded: (subtitles: Subtitle[]) => void;
  onAutoTranscribe?: () => void;
  isTranscribing?: boolean;
  hasRawData?: boolean;
  showAutoTranscribe?: boolean;
}

export function SubtitleProcessor({
  videoId,
  language,
  onSubtitlesLoaded,
  onAutoTranscribe,
  isTranscribing = false,
  hasRawData = false,
  showAutoTranscribe = true,
}: SubtitleProcessorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateSubtitleFile = (file: File): string | null => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !SUPPORTED_SUBTITLE_FORMATS.includes(extension)) {
      return `Unsupported subtitle format. Supported formats: ${SUPPORTED_SUBTITLE_FORMATS.join(
        ", "
      )}`;
    }

    if (file.size > 10 * 1024 * 1024) {
      return "Subtitle file too large. Maximum size: 10MB";
    }

    return null;
  };

  const parseSRT = (content: string): Subtitle[] => {
    const segments = content.trim().split(/\n\s*\n/);
    const subtitles: Subtitle[] = [];

    segments.forEach((segment, index) => {
      const lines = segment.trim().split("\n");
      if (lines.length >= 3) {
        const timeLine = lines[1];
        const timeMatch = timeLine.match(
          /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/
        );

        if (timeMatch) {
          const startTime = parseTimeToSeconds(timeMatch[1]);
          const endTime = parseTimeToSeconds(timeMatch[2]);
          const text = lines.slice(2).join(" ").trim();

          if (text) {
            subtitles.push({
              id: `subtitle-${videoId}-${index}`,
              text,
              start: startTime,
              end: endTime,
              confidence: 1.0, // SRT files don't have confidence scores
              language,
              videoId,
            });
          }
        }
      }
    });

    return subtitles;
  };

  const parseVTT = (content: string): Subtitle[] => {
    const lines = content.trim().split("\n");
    const subtitles: Subtitle[] = [];
    let currentIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip WEBVTT header and empty lines
      if (line === "WEBVTT" || line === "" || line.startsWith("NOTE")) {
        continue;
      }

      // Check if this line contains timestamps
      const timeMatch = line.match(
        /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/
      );

      if (timeMatch) {
        const startTime = parseTimeToSeconds(timeMatch[1]);
        const endTime = parseTimeToSeconds(timeMatch[2]);

        // Collect text lines until next timestamp or end
        const textLines: string[] = [];
        let j = i + 1;
        while (
          j < lines.length &&
          lines[j].trim() !== "" &&
          !lines[j].match(/\d{2}:\d{2}:\d{2}\.\d{3}/)
        ) {
          textLines.push(lines[j].trim());
          j++;
        }

        const text = textLines.join(" ").trim();

        if (text) {
          subtitles.push({
            id: `subtitle-${videoId}-${currentIndex}`,
            text,
            start: startTime,
            end: endTime,
            confidence: 1.0,
            language,
            videoId,
          });
          currentIndex++;
        }

        i = j - 1; // Skip processed lines
      }
    }

    return subtitles;
  };

  const parseTimeToSeconds = (timeString: string): number => {
    const parts = timeString.replace(",", ".").split(":");
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseFloat(parts[2]);

    return hours * 3600 + minutes * 60 + seconds;
  };

  const handleSubtitleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const validationError = validateSubtitleFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      const content = await file.text();
      let subtitles: Subtitle[] = [];

      const extension = file.name.split(".").pop()?.toLowerCase();

      switch (extension) {
        case "srt":
          subtitles = parseSRT(content);
          break;
        case "vtt":
          subtitles = parseVTT(content);
          break;
        case "json":
          try {
            const parsed = JSON.parse(content);
            subtitles = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            setError("Invalid JSON format");
            return;
          }
          break;
        case "txt":
          // Simple text format - split by lines and assign sequential timestamps
          const lines = content.split("\n").filter((line) => line.trim());
          subtitles = lines.map((line, index) => ({
            id: `subtitle-${videoId}-${index}`,
            text: line.trim(),
            start: index * 3, // 3 seconds per line
            end: (index + 1) * 3,
            confidence: 1.0,
            language,
            videoId,
          }));
          break;
        default:
          setError("Unsupported file format");
          return;
      }

      if (subtitles.length === 0) {
        setError("No valid subtitles found in the file");
        return;
      }

      // Call the callback to update the parent component
      onSubtitlesLoaded(subtitles);
      setSuccess(`Successfully loaded ${subtitles.length} subtitle segments`);
    } catch (error) {
      console.error("Error processing subtitle file:", error);
      setError("Failed to process subtitle file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSubtitleFileUpload(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Upload Subtitle File Button */}
        <Button
          onClick={handleBrowseClick}
          disabled={isUploading || isTranscribing}
          variant="outline"
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload Subtitle File"}
        </Button>

        {/* Auto Transcribe Button */}
        {showAutoTranscribe && (
          <Button
            onClick={onAutoTranscribe}
            disabled={isUploading || isTranscribing || hasRawData}
            className="flex-1"
            title={
              hasRawData
                ? "原始数据已存在，无需重复转录"
                : "自动转录音频生成字幕"
            }
          >
            <Mic className="w-4 h-4 mr-2" />
            {isTranscribing
              ? "Transcribing..."
              : hasRawData
              ? "原始数据已存在"
              : "Auto Transcribe"}
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".srt,.vtt,.txt,.json"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Supported formats info */}
      <div className="text-xs text-gray-500">
        Supported subtitle formats: {SUPPORTED_SUBTITLE_FORMATS.join(", ")}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-700">{success}</span>
        </div>
      )}
    </div>
  );
}
