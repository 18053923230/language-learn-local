"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/file-upload";
import { rawTranscriptionStorage } from "@/lib/raw-transcription-storage";
import { subtitleVersionStorage } from "@/lib/subtitle-version-storage";
import { toast } from "sonner";
import { FileText, Star, Clock, CheckCircle, Home } from "lucide-react";
import Link from "next/link";

export default function TestAutoGenerationPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawDataList, setRawDataList] = useState<any[]>([]);
  const [versionList, setVersionList] = useState<any[]>([]);

  const handleFileSelect = async (file: File, language: string) => {
    setIsProcessing(true);
    try {
      // 模拟视频对象创建（与主页面一致）
      const video = {
        id: `api-transcript-${Date.now()}`,
        name: file.name,
        size: file.size,
        language: language,
        duration: 0,
        url: URL.createObjectURL(file),
        format: file.name.split(".").pop() || "mp4",
        uploadedAt: new Date(),
        processed: false,
      };

      console.log("Created video object:", video);

      // 检查原始数据
      const existingRawData = await rawTranscriptionStorage.getRawData(
        video.id
      );
      console.log("Exact match raw data:", existingRawData);

      // 检查所有原始数据
      const allRawData = await rawTranscriptionStorage.getAllRawData();
      setRawDataList(allRawData);

      // 查找相似数据
      const similarRawData = allRawData.find((rawData) => {
        return (
          rawData.metadata.fileName === video.name &&
          rawData.metadata.fileSize === video.size &&
          rawData.language === video.language
        );
      });

      console.log("Similar raw data found:", similarRawData);

      // 检查字幕版本
      const versions = await subtitleVersionStorage.getVersionsByVideoId(
        video.id
      );
      setVersionList(versions);
      console.log("Existing versions:", versions);

      // 检查是否有原始数据但没有版本
      const hasRawData = existingRawData || similarRawData;
      const hasVersions = versions.length > 0;

      console.log("Auto generation check:", {
        hasRawData,
        hasVersions,
        shouldAutoGenerate: hasRawData && !hasVersions,
      });

      if (hasRawData && !hasVersions) {
        toast.success("应该自动生成智能分段字幕！");
      } else if (hasRawData && hasVersions) {
        toast.info("已有字幕版本，无需自动生成");
      } else if (!hasRawData) {
        toast.warning("没有原始数据，需要先转录");
      }
    } catch (error) {
      console.error("Error testing auto generation:", error);
      toast.error("测试失败");
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
    }).format(new Date(date));
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            自动生成功能测试
          </h1>
          <p className="text-gray-600">测试视频加载后的自动检测和生成逻辑</p>
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
            上传测试文件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload onFileSelect={handleFileSelect} />
        </CardContent>
      </Card>

      {/* 原始数据列表 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            原始数据列表 ({rawDataList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {rawDataList.map((rawData, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 rounded-lg"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {rawData.videoId}
                  </div>
                  <div>
                    <span className="font-medium">文件名:</span>{" "}
                    {rawData.metadata.fileName || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">大小:</span>{" "}
                    {rawData.metadata.fileSize || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">语言:</span>{" "}
                    {rawData.language}
                  </div>
                  <div>
                    <span className="font-medium">单词数:</span>{" "}
                    {rawData.metadata.totalWords}
                  </div>
                  <div>
                    <span className="font-medium">段落数:</span>{" "}
                    {rawData.metadata.totalUtterances}
                  </div>
                  <div>
                    <span className="font-medium">置信度:</span>{" "}
                    {(rawData.metadata.averageConfidence * 100).toFixed(1)}%
                  </div>
                  <div>
                    <span className="font-medium">创建时间:</span>{" "}
                    {formatDate(rawData.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 字幕版本列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            字幕版本列表 ({versionList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {versionList.map((version, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 rounded-lg"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="font-medium">版本名:</span>{" "}
                    {version.versionName}
                  </div>
                  <div>
                    <span className="font-medium">类型:</span>{" "}
                    {version.versionType}
                  </div>
                  <div>
                    <span className="font-medium">段落数:</span>{" "}
                    {version.subtitles.length}
                  </div>
                  <div>
                    <span className="font-medium">置信度:</span>{" "}
                    {(version.confidence * 100).toFixed(1)}%
                  </div>
                  <div>
                    <span className="font-medium">默认:</span>{" "}
                    {version.isDefault ? "是" : "否"}
                  </div>
                  <div>
                    <span className="font-medium">创建时间:</span>{" "}
                    {formatDate(version.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            {versionList.length === 0 && (
              <div className="text-center text-gray-500 py-8">暂无字幕版本</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
