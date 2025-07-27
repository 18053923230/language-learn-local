"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, Download } from "lucide-react";
import { SubtitleRecord } from "@/lib/subtitle-storage";

interface SubtitleDetectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSubtitles: () => void;
  record: SubtitleRecord;
  isExactMatch?: boolean;
}

export function SubtitleDetectionDialog({
  isOpen,
  onClose,
  onLoadSubtitles,
  record,
  isExactMatch = false,
}: SubtitleDetectionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadSubtitles = async () => {
    setIsLoading(true);
    try {
      await onLoadSubtitles();
      onClose();
    } catch (error) {
      console.error("Error loading subtitles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isExactMatch ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-600" />
            )}
            <span>
              {isExactMatch ? "Exact Match Found" : "Similar Video Found"}
            </span>
          </DialogTitle>
          <DialogDescription>
            {isExactMatch
              ? "We found existing subtitles for this exact video."
              : "We found subtitles for a similar video that might match."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Video Details</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>
                <strong>Name:</strong> {record.videoName}
              </div>
              <div>
                <strong>Language:</strong> {record.language}
              </div>
              <div>
                <strong>Duration:</strong> {formatDuration(record.duration)}
              </div>
              <div>
                <strong>Subtitles:</strong> {record.subtitles.length} segments
              </div>
              <div>
                <strong>Confidence:</strong>{" "}
                {Math.round(record.confidence * 100)}%
              </div>
              <div>
                <strong>Created:</strong> {formatDate(record.createdAt)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleLoadSubtitles}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Loading..." : "Load Subtitles"}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </div>

          {/* Info Text */}
          <p className="text-xs text-gray-500 text-center">
            {isExactMatch
              ? "Loading these subtitles will avoid duplicate recognition costs."
              : "This will link the existing subtitles to your current video."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
