"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, Check, AlertCircle } from "lucide-react";
import { subtitleStorage } from "@/lib/subtitle-storage";
import { Subtitle } from "@/types/subtitle";
import { Video } from "@/types/video";
import { toast } from "sonner";

interface SubtitleSaveButtonProps {
  video: Video;
  subtitles: Subtitle[];
  source?: "assemblyai" | "upload" | "manual";
  onSaved?: () => void;
}

export function SubtitleSaveButton({
  video,
  subtitles,
  source = "assemblyai",
  onSaved,
}: SubtitleSaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasExistingRecord, setHasExistingRecord] = useState(false);

  // 检查是否已有保存记录
  const checkExistingRecord = async () => {
    try {
      const hasRecord = await subtitleStorage.hasSubtitleRecord(video);
      setHasExistingRecord(hasRecord);
    } catch (error) {
      console.error("Error checking existing record:", error);
    }
  };

  // 组件加载时检查
  useEffect(() => {
    checkExistingRecord();
  }, [video.id, subtitles.length]); // 当字幕数量变化时也重新检查

  const handleSave = async () => {
    if (!video || subtitles.length === 0) {
      toast.error("No subtitles to save");
      return;
    }

    setIsSaving(true);

    try {
      // 检查是否有相同视频的记录
      const similarRecord = await subtitleStorage.hasSimilarVideoRecord(video);

      if (similarRecord && !hasExistingRecord) {
        // 提示用户是否要使用现有记录
        const useExisting = confirm(
          `Found existing subtitle record for similar video:\n"${similarRecord.videoName}"\n\nWould you like to use the existing subtitles? This will avoid duplicate recognition.`
        );

        if (useExisting) {
          // 使用现有字幕
          toast.success("Loaded existing subtitle record");
          onSaved?.();
          setIsSaved(true);
          setHasExistingRecord(true);
          return;
        }
      }

      // 保存新记录或更新现有记录
      if (hasExistingRecord) {
        // 更新现有记录
        const record = await subtitleStorage.getSubtitleRecordByVideoId(
          video.id
        );
        if (record) {
          await subtitleStorage.updateSubtitleRecord(record.id, subtitles);
          toast.success("Subtitles updated");
        }
      } else {
        // 保存新记录
        await subtitleStorage.saveSubtitleRecord(video, subtitles, source);
        toast.success("Subtitles saved to local database");
      }

      setIsSaved(true);
      setHasExistingRecord(true);
      onSaved?.();

      // 3秒后重置状态
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving subtitles:", error);
      toast.error("Failed to save subtitles");
    } finally {
      setIsSaving(false);
    }
  };

  const getButtonText = () => {
    if (isSaving) return "Saving...";
    if (isSaved) return "Saved";
    if (hasExistingRecord) return "Update Subtitles";
    return "Save Subtitles";
  };

  const getButtonIcon = () => {
    if (isSaving)
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      );
    if (isSaved) return <Check className="w-4 h-4" />;
    if (hasExistingRecord) return <AlertCircle className="w-4 h-4" />;
    return <Save className="w-4 h-4" />;
  };

  const getButtonVariant = () => {
    if (isSaved) return "default" as const;
    if (hasExistingRecord) return "outline" as const;
    return "default" as const;
  };

  return (
    <Button
      onClick={handleSave}
      disabled={isSaving || subtitles.length === 0}
      variant={getButtonVariant()}
      size="sm"
      className="flex items-center space-x-2"
    >
      {getButtonIcon()}
      <span>{getButtonText()}</span>
    </Button>
  );
}
