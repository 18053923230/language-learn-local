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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
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
      <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-2xl border-0">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center space-x-3 text-xl font-bold">
            {isExactMatch ? (
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <span className="text-gray-900">
              {isExactMatch ? "Exact Match Found" : "Similar Video Found"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 leading-relaxed">
            {isExactMatch
              ? "We found existing subtitles for this exact video."
              : "We found subtitles for a similar video that might match."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-blue-600 text-xs">📹</span>
              </span>
              Video Details
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-start">
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="text-gray-900 text-right max-w-xs truncate">
                  {record.videoName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Language:</span>
                <span className="text-blue-600 font-semibold">
                  {record.language}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Duration:</span>
                <span className="text-gray-900 font-semibold">
                  {formatTime(record.duration)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Subtitles:</span>
                <span className="text-purple-600 font-semibold">
                  {record.subtitles.length} segments
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Confidence:</span>
                <span className="text-green-600 font-semibold">
                  {Math.round(record.confidence * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Created:</span>
                <span className="text-gray-900 font-semibold">
                  {formatDate(record.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleLoadSubtitles}
              disabled={isLoading}
              className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Loading..." : "Load Subtitles"}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="h-12 px-6 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            {isExactMatch
              ? "Loading these subtitles will avoid duplicate recognition costs."
              : "This will link the existing subtitles to your current video."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
