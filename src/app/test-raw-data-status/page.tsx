"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { rawTranscriptionStorage } from "@/lib/raw-transcription-storage";
import { toast } from "sonner";

export default function TestRawDataStatusPage() {
  const [allRawData, setAllRawData] = useState<any[]>([]);
  const [testVideo, setTestVideo] = useState<any>(null);
  const [hasRawData, setHasRawData] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRawData();
  }, []);

  const loadRawData = async () => {
    try {
      setLoading(true);
      const data = await rawTranscriptionStorage.getAllRawData();
      setAllRawData(data);
    } catch (error) {
      console.error("Error loading raw data:", error);
      toast.error("加载原始数据失败");
    } finally {
      setLoading(false);
    }
  };

  const createTestVideo = () => {
    const video = {
      id: `test-${Date.now()}`,
      name: "test-video.mp4",
      size: 1024000,
      language: "en",
    };
    setTestVideo(video);
    checkRawDataStatus(video);
  };

  const checkRawDataStatus = async (video: any) => {
    try {
      // Check for exact video match first
      const existingRawData = await rawTranscriptionStorage.getRawData(
        video.id
      );

      if (existingRawData) {
        setHasRawData(true);
        console.log("Found existing raw data for video:", video.id);
        return;
      }

      // Check all raw data for similar videos
      const allRawData = await rawTranscriptionStorage.getAllRawData();

      // Generate a simple hash for comparison
      const videoHash = `${video.name}-${video.size}-${video.language}`;

      const similarRawData = allRawData.find((rawData) => {
        // Check if the raw data was created for a similar video
        const rawDataHash = rawData.videoId.replace("api-transcript-", "");
        return (
          rawDataHash.includes(video.name) ||
          rawDataHash.includes(video.size.toString()) ||
          rawData.language === video.language
        );
      });

      if (similarRawData) {
        setHasRawData(true);
        console.log("Found similar raw data for video:", video.id);
        return;
      }

      // If no raw data found, ensure the state is false
      setHasRawData(false);
    } catch (error) {
      console.error("Error checking for existing raw data:", error);
      setHasRawData(false);
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">原始数据状态检测测试</h1>
        <p className="text-gray-600">测试视频原始数据状态检测功能</p>
      </div>

      {/* 测试控制 */}
      <Card>
        <CardHeader>
          <CardTitle>测试控制</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={createTestVideo} className="w-full">
            创建测试视频并检测状态
          </Button>

          {testVideo && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">测试视频信息:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">ID:</span> {testVideo.id}
                </div>
                <div>
                  <span className="font-medium">名称:</span> {testVideo.name}
                </div>
                <div>
                  <span className="font-medium">大小:</span> {testVideo.size}{" "}
                  bytes
                </div>
                <div>
                  <span className="font-medium">语言:</span>{" "}
                  {testVideo.language}
                </div>
              </div>

              <div className="mt-3">
                <span className="font-medium">原始数据状态: </span>
                <Badge variant={hasRawData ? "default" : "secondary"}>
                  {hasRawData ? "已存在" : "不存在"}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 原始数据列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            本地原始数据
            <Badge variant="outline">{allRawData.length} 条记录</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">加载中...</p>
            </div>
          ) : allRawData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>暂无原始数据</p>
              <p className="text-sm mt-2">请先上传音频文件进行转录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allRawData.map((data) => (
                <div
                  key={data.id}
                  className={`p-3 border rounded-lg ${
                    testVideo &&
                    (data.videoId === testVideo.id ||
                      data.videoId.includes(testVideo.name) ||
                      data.videoId.includes(testVideo.size.toString()) ||
                      data.language === testVideo.language)
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{data.videoId}</h4>
                      <p className="text-xs text-gray-600">
                        语言: {data.language} | 单词: {data.metadata.totalWords}{" "}
                        | 置信度:{" "}
                        {(data.metadata.averageConfidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {formatDate(data.createdAt)}
                      </p>
                      {testVideo &&
                        (data.videoId === testVideo.id ||
                          data.videoId.includes(testVideo.name) ||
                          data.videoId.includes(testVideo.size.toString()) ||
                          data.language === testVideo.language) && (
                          <Badge variant="outline" className="text-xs mt-1">
                            匹配
                          </Badge>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => (window.location.href = "/test-raw-data")}
          variant="outline"
        >
          返回原始数据测试
        </Button>
        <Button
          onClick={() => (window.location.href = "/subtitles")}
          variant="outline"
        >
          查看字幕管理页面
        </Button>
      </div>
    </div>
  );
}
