"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoProcessor = void 0;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class VideoProcessor {
    constructor(ffmpegService) {
        this.ffmpegService = ffmpegService;
    }
    async processVideoSegments(segments, options = {}, onProgress) {
        const { outputFormat = "mp4", quality = "medium", includeTransitions = true, transitionDuration = 0.5, addSubtitles = true, subtitleStyle = "overlay", outputResolution = "720p", useHardwareAcceleration = false, } = options;
        try {
            onProgress?.({
                stage: "preparing",
                progress: 10,
                message: "Preparing video segments...",
                totalSegments: segments.length,
            });
            // 处理视频片段
            const segmentFiles = await this.processMultipleVideoSegments(segments, {
                quality,
                useHardwareAcceleration,
            }, (current, total) => {
                onProgress?.({
                    stage: "processing",
                    progress: 10 + (current / total) * 40,
                    message: `Processing segment ${current} of ${total}...`,
                    currentSegment: current,
                    totalSegments: total,
                });
            });
            onProgress?.({
                stage: "combining",
                progress: 50,
                message: "Combining video segments...",
            });
            // 合并视频片段
            const outputPath = path.join(os.tmpdir(), `output_${Date.now()}.${outputFormat}`);
            await this.ffmpegService.combineVideos(segmentFiles, outputPath, {
                quality,
                useHardwareAcceleration,
                addTransitions: includeTransitions,
                transitionDuration,
            });
            onProgress?.({
                stage: "finalizing",
                progress: 90,
                message: "Finalizing video...",
            });
            // 读取输出文件
            const videoBuffer = fs.readFileSync(outputPath);
            // 清理临时文件
            await this.cleanupSegmentFiles(segmentFiles);
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
            onProgress?.({
                stage: "completed",
                progress: 100,
                message: "Video generation completed!",
            });
            return videoBuffer;
        }
        catch (error) {
            console.error("Video processing failed:", error);
            throw error;
        }
    }
    async processMultipleVideoSegments(videoSegments, options, onProgress) {
        const segmentFiles = [];
        const batchSize = Math.min(os.cpus().length, 4); // 复用现有的批处理逻辑
        for (let i = 0; i < videoSegments.length; i += batchSize) {
            const batch = videoSegments.slice(i, i + batchSize);
            const batchPromises = batch.map((segment, batchIndex) => this.processSegment(segment, options, i + batchIndex));
            const batchResults = await Promise.all(batchPromises);
            segmentFiles.push(...batchResults);
            onProgress?.(Math.min(i + batchSize, videoSegments.length), videoSegments.length);
        }
        return segmentFiles;
    }
    async processSegment(segment, options, globalIndex) {
        const segmentFileName = path.join(os.tmpdir(), `segment_${globalIndex}_${Date.now()}.mp4`);
        await this.ffmpegService.extractVideoSegment(segment.videoFile.path, segmentFileName, segment.startTime, segment.endTime - segment.startTime, {
            quality: options.quality,
            useHardwareAcceleration: options.useHardwareAcceleration,
            preset: "ultrafast",
            crf: 23,
            audioBitrate: "128k",
        });
        return segmentFileName;
    }
    async cleanupSegmentFiles(segmentFiles) {
        for (const file of segmentFiles) {
            try {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            }
            catch (error) {
                console.error(`Failed to cleanup segment file ${file}:`, error);
            }
        }
    }
}
exports.VideoProcessor = VideoProcessor;
