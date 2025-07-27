"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { assemblyAIService } from "@/lib/assemblyai-service";
import { rawTranscriptionStorage } from "@/lib/raw-transcription-storage";
import { subtitleVersionStorage } from "@/lib/subtitle-version-storage";
import { toast } from "sonner";

export default function TestRawDataPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawData, setRawData] = useState<any>(null);
  const [savedData, setSavedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setRawData(null);
    setSavedData(null);

    try {
      console.log("Processing file:", file.name);

      // Initialize AssemblyAI service
      await assemblyAIService.initialize("en");

      // Start transcription
      const result = await assemblyAIService.transcribeAudio(
        file,
        `test-${Date.now()}`,
        "en",
        (progress: any) => {
          console.log("Progress:", progress);
        }
      );

      console.log("Transcription result:", result);
      setRawData(result.rawData);

      // Save raw data
      if (result.rawData) {
        try {
          await rawTranscriptionStorage.saveRawData(result.rawData);
          console.log("Raw data saved successfully");

          // Create subtitle version
          const version = await subtitleVersionStorage.createRawVersionFromData(
            result.rawData.videoId,
            result.rawData,
            result.segments
          );

          setSavedData({
            rawData: result.rawData,
            version: version,
          });

          toast.success("原始数据和字幕版本保存成功！");
        } catch (error) {
          console.error("Error saving data:", error);
          setError(error instanceof Error ? error.message : "保存失败");
          toast.error(
            "保存失败: " + (error instanceof Error ? error.message : "未知错误")
          );
        }
      } else {
        setError("No raw data received");
        toast.error("未收到原始数据");
      }
    } catch (err) {
      console.error("Error processing file:", err);
      setError(err instanceof Error ? err.message : "处理失败");
      toast.error(
        "处理失败: " + (err instanceof Error ? err.message : "未知错误")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(date));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">原始数据保存测试</h1>
        <p className="text-gray-600">测试 AssemblyAI 转录数据的本地保存功能</p>
      </div>

      {/* 文件上传 */}
      <Card>
        <CardHeader>
          <CardTitle>上传音频文件</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={handleFileSelect}
            disabled={isProcessing}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {isProcessing && (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">正在处理中...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 错误显示 */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-red-800 mb-2">错误</h3>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* 原始数据显示 */}
      {rawData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                原始数据
              </Badge>
              AssemblyAI 转录结果
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="font-medium">ID:</span>
                <p className="text-sm text-gray-600">{rawData.id}</p>
              </div>
              <div>
                <span className="font-medium">视频ID:</span>
                <p className="text-sm text-gray-600">{rawData.videoId}</p>
              </div>
              <div>
                <span className="font-medium">语言:</span>
                <p className="text-sm text-gray-600">{rawData.language}</p>
              </div>
              <div>
                <span className="font-medium">创建时间:</span>
                <p className="text-sm text-gray-600">
                  {formatDate(rawData.createdAt)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="font-medium">总单词数:</span>
                <p className="text-sm text-gray-600">
                  {rawData.metadata.totalWords}
                </p>
              </div>
              <div>
                <span className="font-medium">总话语数:</span>
                <p className="text-sm text-gray-600">
                  {rawData.metadata.totalUtterances}
                </p>
              </div>
              <div>
                <span className="font-medium">平均置信度:</span>
                <p className="text-sm text-gray-600">
                  {(rawData.metadata.averageConfidence * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <span className="font-medium">音频时长:</span>
                <p className="text-sm text-gray-600">
                  {formatDuration(rawData.metadata.audioDuration)}
                </p>
              </div>
            </div>

            <div>
              <span className="font-medium">完整文本:</span>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 max-h-40 overflow-y-auto">
                {rawData.assemblyData.text}
              </div>
            </div>

            <div>
              <span className="font-medium">单词详情 (前10个):</span>
              <div className="mt-2 space-y-1">
                {rawData.assemblyData.words
                  ?.slice(0, 10)
                  .map((word: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="font-medium">{word.text}</span>
                      <span className="text-gray-500">
                        {formatDuration(word.start / 1000)} -{" "}
                        {formatDuration(word.end / 1000)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {(word.confidence * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 保存结果显示 */}
      {savedData && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                保存成功
              </Badge>
              数据已保存到本地
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="font-medium">原始数据ID:</span>
                <p className="text-sm text-gray-600">{savedData.rawData.id}</p>
              </div>
              <div>
                <span className="font-medium">字幕版本ID:</span>
                <p className="text-sm text-gray-600">{savedData.version.id}</p>
              </div>
              <div>
                <span className="font-medium">版本名称:</span>
                <p className="text-sm text-gray-600">
                  {savedData.version.versionName}
                </p>
              </div>
              <div>
                <span className="font-medium">版本类型:</span>
                <p className="text-sm text-gray-600">
                  {savedData.version.versionType}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="font-medium">字幕段落数:</span>
                <p className="text-sm text-gray-600">
                  {savedData.version.metadata.totalSegments}
                </p>
              </div>
              <div>
                <span className="font-medium">总时长:</span>
                <p className="text-sm text-gray-600">
                  {formatDuration(savedData.version.metadata.totalDuration)}
                </p>
              </div>
              <div>
                <span className="font-medium">平均段落长度:</span>
                <p className="text-sm text-gray-600">
                  {savedData.version.metadata.averageSegmentLength.toFixed(1)}{" "}
                  字符
                </p>
              </div>
              <div>
                <span className="font-medium">是否默认:</span>
                <p className="text-sm text-gray-600">
                  {savedData.version.isDefault ? "是" : "否"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => (window.location.href = "/subtitles")}
          variant="outline"
        >
          查看字幕管理页面
        </Button>
        <Button
          onClick={() => (window.location.href = "/debug-storage")}
          variant="outline"
        >
          查看调试存储页面
        </Button>
      </div>
    </div>
  );
}
