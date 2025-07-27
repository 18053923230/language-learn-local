"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/file-upload";
import { assemblyAIService } from "@/lib/assemblyai-service";
import { rawTranscriptionStorage } from "@/lib/raw-transcription-storage";
import { subtitleVersionStorage } from "@/lib/subtitle-version-storage";
import { defaultSubtitleGenerator } from "@/lib/subtitle-generator";
import { toast } from "sonner";
import { FileText, Star, Clock, CheckCircle, Home } from "lucide-react";
import Link from "next/link";

export default function TestSubtitleGenerationPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawData, setRawData] = useState<any>(null);
  const [generatedSubtitles, setGeneratedSubtitles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const handleFileSelect = async (file: File, language: string) => {
    setIsProcessing(true);
    try {
      // 转录音频
      const videoId = `test-${Date.now()}`;
      const result = await assemblyAIService.transcribeAudio(
        file,
        videoId,
        language
      );

      if (result.rawData) {
        setRawData(result.rawData);

        // 保存原始数据
        await rawTranscriptionStorage.saveRawData(result.rawData);
        toast.success("原始数据保存成功");

        // 生成智能分段字幕
        const subtitles = defaultSubtitleGenerator.generateFromRawData(
          result.rawData
        );
        setGeneratedSubtitles(subtitles);

        // 显示原始单词数据（用于调试）
        console.log("Original words data:", result.rawData.assemblyData.words);

        // 获取统计信息
        const generationStats = defaultSubtitleGenerator.getGenerationStats(
          result.rawData
        );
        setStats(generationStats);

        // 创建字幕版本
        const smartVersion =
          await subtitleVersionStorage.createSmartVersionFromRawData(
            result.rawData.videoId,
            result.rawData
          );

        // 保存到本地存储，使其可以在主页面使用
        try {
          // 导入 StorageManager
          const { StorageManager } = await import("@/lib/storage");

          // 保存字幕到本地存储
          await StorageManager.saveSubtitles(smartVersion.subtitles);

          // 创建一个模拟的视频对象
          const mockVideo = {
            id: result.rawData.videoId,
            name: file.name,
            url: URL.createObjectURL(file),
            size: file.size,
            format: file.name.split(".").pop() || "mp4",
            language: language,
            duration: stats.totalDuration,
            uploadedAt: new Date(),
            processed: true,
          };

          // 保存视频信息
          await StorageManager.saveVideo(mockVideo);

          toast.success(
            `智能分段字幕生成并保存成功！共 ${subtitles.length} 个段落。现在可以在主页面查看。`
          );
        } catch (storageError) {
          console.error("Error saving to local storage:", storageError);
          toast.error("字幕生成成功，但保存到本地存储失败");
        }

        console.log("Generated subtitles:", subtitles);
        console.log("Generation stats:", generationStats);
        console.log("Smart version:", smartVersion);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("处理失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            字幕生成测试
          </h1>
          <p className="text-gray-600">
            测试基于句末标点的智能分段字幕生成功能
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            返回主页面
          </Button>
        </Link>
      </div>

      {/* 文件上传 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            上传音频文件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload onFileSelect={handleFileSelect} />
        </CardContent>
      </Card>

      {/* 原始数据信息 */}
      {rawData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              原始转录数据
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">视频ID:</span> {rawData.videoId}
              </div>
              <div>
                <span className="font-medium">语言:</span> {rawData.language}
              </div>
              <div>
                <span className="font-medium">创建时间:</span>{" "}
                {formatDate(rawData.createdAt)}
              </div>
              <div>
                <span className="font-medium">总单词数:</span>{" "}
                {rawData.metadata?.totalWords || 0}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 原始单词数据（用于调试） */}
      {rawData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              原始单词数据（调试用）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {rawData.assemblyData.words
                ?.slice(0, 50)
                .map((word: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-gray-500 w-16">
                      {Math.floor(word.start / 1000)}:
                      {Math.floor((word.start % 1000) / 10)
                        .toString()
                        .padStart(2, "0")}
                    </span>
                    <span
                      className={`px-2 py-1 rounded ${
                        word.text.trim().endsWith(".") ||
                        word.text.trim().endsWith("!") ||
                        word.text.trim().endsWith("?")
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {word.text}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(word.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              {rawData.assemblyData.words?.length > 50 && (
                <div className="text-gray-500 text-sm">
                  ... 还有 {rawData.assemblyData.words.length - 50} 个单词
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 生成统计信息 */}
      {stats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              生成统计信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalSegments}
                </div>
                <div className="text-sm text-gray-600">段落数</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalWords}
                </div>
                <div className="text-sm text-gray-600">单词数</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.averageSegmentLength.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">平均段落长度</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {(stats.averageConfidence * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">平均置信度</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {formatTime(stats.totalDuration)}
                </div>
                <div className="text-sm text-gray-600">总时长</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 生成的字幕列表 */}
      {generatedSubtitles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              智能分段字幕 ({generatedSubtitles.length} 个段落)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {generatedSubtitles.map((subtitle, index) => (
                <div
                  key={subtitle.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="text-sm font-mono text-gray-500">
                        {formatTime(subtitle.start)} -{" "}
                        {formatTime(subtitle.end)}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        subtitle.confidence > 0.8
                          ? "bg-green-100 text-green-700 border-green-200"
                          : subtitle.confidence > 0.6
                          ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }`}
                    >
                      {(subtitle.confidence * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-gray-900">{subtitle.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
