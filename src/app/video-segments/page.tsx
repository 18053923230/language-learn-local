"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FolderOpen,
  Video,
  Database,
  Trash2,
  Download,
  Play,
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  HardDrive,
} from "lucide-react";
import {
  VideoSegmentFolder,
  VideoSegment,
  SegmentCompositionOptions,
  SegmentCompositionProgress,
} from "@/types/video-segment";
import { videoSegmentStorage } from "@/lib/video-segment-storage";
import { smartVideoSegmentManager } from "@/lib/smart-video-segment-manager";
import { FolderOpener } from "@/lib/folder-opener";
import { toast } from "sonner";
import Link from "next/link";

export default function VideoSegmentsPage() {
  const [folders, setFolders] = useState<VideoSegmentFolder[]>([]);
  const [selectedFolder, setSelectedFolder] =
    useState<VideoSegmentFolder | null>(null);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [compositionProgress, setCompositionProgress] =
    useState<SegmentCompositionProgress | null>(null);
  const [compositionOptions, setCompositionOptions] =
    useState<SegmentCompositionOptions>({
      outputFormat: "mp4",
      quality: "medium",
      resolution: "720p",
      includeTransitions: true,
      transitionDuration: 0.5,
      addSubtitles: true,
      subtitleStyle: "overlay",
      segmentOrder: "time",
    });

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setIsLoading(true);
      // 这里需要获取所有视频的片段文件夹
      // 暂时使用模拟数据
      const mockFolders: VideoSegmentFolder[] = [
        {
          id: "folder_1",
          videoId: "video_1",
          folderName:
            "sample_video_segments_mp4_medium_720p_10_2024-01-27T10-30-00",
          folderPath:
            "segments/sample_video_segments_mp4_medium_720p_10_2024-01-27T10-30-00",
          totalSegments: 10,
          completedSegments: 10,
          totalSize: 1024 * 1024 * 50, // 50MB
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "completed",
          metadata: {
            originalVideoName: "sample_video.mp4",
            originalVideoSize: 1024 * 1024 * 100,
            language: "en",
            generationOptions: {
              format: "mp4",
              quality: "medium",
              resolution: "720p",
            },
          },
        },
      ];
      setFolders(mockFolders);
    } catch (error) {
      console.error("Error loading folders:", error);
      toast.error("加载片段文件夹失败");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSegments = async (folderName: string) => {
    try {
      const folderSegments = await videoSegmentStorage.getSegmentsByFolder(
        folderName
      );
      setSegments(folderSegments);
    } catch (error) {
      console.error("Error loading segments:", error);
      toast.error("加载片段失败");
    }
  };

  const handleFolderClick = async (folder: VideoSegmentFolder) => {
    setSelectedFolder(folder);
    await loadSegments(folder.folderName);
  };

  const handleOpenFolder = async (folder: VideoSegmentFolder) => {
    try {
      await FolderOpener.openFolder(folder.folderPath);
    } catch (error) {
      console.error("Error opening folder:", error);
      toast.error("打开文件夹失败");
    }
  };

  const handleDeleteFolder = async (folder: VideoSegmentFolder) => {
    const confirmed = confirm(
      `确定要删除文件夹 "${folder.folderName}" 及其所有片段吗？此操作不可撤销。`
    );

    if (confirmed) {
      try {
        await videoSegmentStorage.deleteFolder(folder.id);
        toast.success("文件夹删除成功");
        loadFolders();
      } catch (error) {
        console.error("Error deleting folder:", error);
        toast.error("删除文件夹失败");
      }
    }
  };

  const handleComposeVideo = async () => {
    if (!selectedFolder || segments.length === 0) {
      toast.error("请先选择包含片段的文件夹");
      return;
    }

    setIsComposing(true);
    setCompositionProgress(null);

    try {
      const segmentIds = segments.map((s) => s.id);
      const videoBlob = await smartVideoSegmentManager.quickComposeVideo(
        selectedFolder.folderName,
        segmentIds,
        compositionOptions,
        (progress) => {
          setCompositionProgress(progress);
        }
      );

      // 下载合成的视频
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `composed_${selectedFolder.folderName}.${compositionOptions.outputFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("视频合成完成！");
    } catch (error) {
      console.error("Error composing video:", error);
      toast.error("视频合成失败");
    } finally {
      setIsComposing(false);
      setCompositionProgress(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "已完成";
      case "processing":
        return "处理中";
      case "failed":
        return "失败";
      default:
        return "待处理";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <HardDrive className="w-8 h-8 mr-3 text-blue-600" />
                视频片段管理
              </h1>
              <p className="text-gray-600 mt-2">
                管理已生成的视频片段，支持快速合成和批量操作
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <Video className="w-4 h-4 mr-2" />
                返回主页
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 文件夹列表 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderOpen className="w-5 h-5 mr-2" />
                  片段文件夹 ({folders.length})
                </CardTitle>
                <CardDescription>已生成的视频片段文件夹列表</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : folders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无片段文件夹</p>
                    <p className="text-sm">请先使用智能片段生成功能</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedFolder?.id === folder.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleFolderClick(folder)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusIcon(folder.status)}
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {folder.folderName}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>
                                片段: {folder.completedSegments}/
                                {folder.totalSegments}
                              </p>
                              <p>
                                大小:{" "}
                                {(folder.totalSize / 1024 / 1024).toFixed(1)} MB
                              </p>
                              <p>状态: {getStatusText(folder.status)}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenFolder(folder);
                              }}
                            >
                              <FolderOpen className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(folder);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 片段详情和合成 */}
          <div className="lg:col-span-2">
            {selectedFolder ? (
              <div className="space-y-6">
                {/* 文件夹信息 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>文件夹详情</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedFolder.status)}
                        <span className="text-sm font-medium">
                          {getStatusText(selectedFolder.status)}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">原始视频</p>
                        <p className="font-medium">
                          {selectedFolder.metadata.originalVideoName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">语言</p>
                        <p className="font-medium">
                          {selectedFolder.metadata.language}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">格式</p>
                        <p className="font-medium">
                          {selectedFolder.metadata.generationOptions.format.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">质量</p>
                        <p className="font-medium">
                          {selectedFolder.metadata.generationOptions.quality}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 片段列表 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>片段列表 ({segments.length})</span>
                      <Button
                        onClick={handleComposeVideo}
                        disabled={isComposing || segments.length === 0}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {isComposing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            合成中...
                          </>
                        ) : (
                          <>
                            <Video className="w-4 h-4 mr-2" />
                            合成视频
                          </>
                        )}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {segments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>暂无片段</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {segments.map((segment) => (
                          <div
                            key={segment.id}
                            className="p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  {getStatusIcon(segment.status)}
                                  <span className="text-sm font-medium text-gray-900">
                                    {segment.fileName}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {segment.subtitle.text}
                                </p>
                                <div className="text-xs text-gray-500 space-y-1">
                                  <p>时长: {segment.duration.toFixed(1)}s</p>
                                  <p>
                                    大小:{" "}
                                    {(segment.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                  <p>
                                    时间: {segment.subtitle.start.toFixed(1)}s -{" "}
                                    {segment.subtitle.end.toFixed(1)}s
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <Button size="sm" variant="ghost">
                                  <Play className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 合成进度 */}
                {isComposing && compositionProgress && (
                  <Card>
                    <CardHeader>
                      <CardTitle>合成进度</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {compositionProgress.message}
                            </div>
                            {compositionProgress.currentSegment &&
                              compositionProgress.totalSegments && (
                                <div className="text-xs text-gray-600">
                                  片段 {compositionProgress.currentSegment} /{" "}
                                  {compositionProgress.totalSegments}
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${compositionProgress.progress}%`,
                            }}
                          />
                        </div>

                        <div className="text-xs text-gray-600 text-center">
                          {Math.round(compositionProgress.progress)}% 完成
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center text-gray-500">
                    <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">选择文件夹</p>
                    <p className="text-sm">
                      请从左侧选择一个片段文件夹查看详情
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
