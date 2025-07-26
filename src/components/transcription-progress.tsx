import React from "react";
import { ProcessingProgress } from "@/lib/whisper-client";
import { Button } from "@/components/ui/button";
import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface TranscriptionProgressProps {
  progress: ProcessingProgress | null;
  onCancel?: () => void;
  onRetry?: () => void;
}

export function TranscriptionProgress({
  progress,
  onCancel,
  onRetry,
}: TranscriptionProgressProps) {
  if (!progress) return null;

  const getProgressColor = () => {
    switch (progress.stage) {
      case "loading":
        return "bg-blue-500";
      case "processing":
        return "bg-green-500";
      case "completed":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getIcon = () => {
    switch (progress.stage) {
      case "loading":
      case "processing":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStageText = () => {
    switch (progress.stage) {
      case "loading":
        return "Loading Model";
      case "processing":
        return "Transcribing";
      case "completed":
        return "Completed";
      case "error":
        return "Error";
      default:
        return "Processing";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <span className="font-medium text-sm">{getStageText()}</span>
        </div>
        {progress.stage === "loading" || progress.stage === "processing" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>{progress.message}</span>
          <span>{Math.round(progress.progress)}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      {progress.stage === "error" && onRetry && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {progress.currentSegment && progress.totalSegments && (
        <div className="text-xs text-gray-500">
          Processing segment {progress.currentSegment} of{" "}
          {progress.totalSegments}
        </div>
      )}
    </div>
  );
}
