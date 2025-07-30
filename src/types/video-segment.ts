import { Subtitle } from "./subtitle";

// 视频片段信息
export interface VideoSegment {
  id: string;
  videoId: string;
  subtitleId: string;
  folderName: string;
  fileName: string;
  filePath: string;
  subtitle: Subtitle;
  duration: number;
  size: number;
  format: "mp4" | "webm" | "avi";
  quality: "low" | "medium" | "high";
  resolution: "480p" | "720p" | "1080p";
  createdAt: Date;
  updatedAt: Date;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

// 视频片段文件夹信息
export interface VideoSegmentFolder {
  id: string;
  videoId: string;
  folderName: string;
  folderPath: string;
  totalSegments: number;
  completedSegments: number;
  totalSize: number;
  createdAt: Date;
  updatedAt: Date;
  status: "pending" | "processing" | "completed" | "failed";
  metadata: {
    originalVideoName: string;
    originalVideoSize: number;
    language: string;
    subtitleVersionId?: string;
    generationOptions: {
      format: "mp4" | "webm" | "avi";
      quality: "low" | "medium" | "high";
      resolution: "480p" | "720p" | "1080p";
    };
  };
}

// 片段生成选项
export interface SegmentGenerationOptions {
  format: "mp4" | "webm" | "avi";
  quality: "low" | "medium" | "high";
  resolution: "480p" | "720p" | "1080p";
  useOptimization?: boolean;
  parallelProcessing?: boolean;
}

// 片段生成进度
export interface SegmentGenerationProgress {
  stage: "checking" | "preparing" | "processing" | "saving" | "completed";
  progress: number;
  message: string;
  currentSegment?: number;
  totalSegments?: number;
  folderName?: string;
}

// 片段合成选项
export interface SegmentCompositionOptions {
  outputFormat: "mp4" | "webm" | "avi";
  quality: "low" | "medium" | "high";
  resolution: "480p" | "720p" | "1080p";
  includeTransitions: boolean;
  transitionDuration: number;
  addSubtitles: boolean;
  subtitleStyle: "burned" | "overlay";
  segmentOrder: "time" | "custom";
  customOrder?: string[]; // 自定义片段ID顺序
}

// 片段合成进度
export interface SegmentCompositionProgress {
  stage: "preparing" | "loading" | "combining" | "finalizing" | "completed";
  progress: number;
  message: string;
  currentSegment?: number;
  totalSegments?: number;
}
