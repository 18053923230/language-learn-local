import { Subtitle } from "./subtitle";

export interface SubtitleVersion {
  id: string;
  videoId: string;
  versionName: string; // "原始字幕" | "自定义字幕" | "优化字幕"
  versionType: "raw" | "custom" | "optimized";
  subtitles: Subtitle[];
  createdAt: Date;
  updatedAt: Date;
  description?: string; // 版本描述
  confidence: number;
  source: "assemblyai" | "upload" | "manual" | "optimized";
  isDefault: boolean; // 是否为默认版本
  metadata?: {
    totalSegments: number;
    totalDuration: number;
    averageSegmentLength: number;
    optimizationParams?: any; // 优化参数（如果是优化版本）
  };
}

export interface SubtitleVersionSelection {
  videoId: string;
  availableVersions: SubtitleVersion[];
  currentVersion?: SubtitleVersion;
  onSelect: (version: SubtitleVersion) => void;
  onCreateNew: () => void;
  onDelete?: (versionId: string) => void;
}
