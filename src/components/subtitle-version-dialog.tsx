"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubtitleVersion } from "@/types/subtitle-version";
import { FileText, Star, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface SubtitleVersionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  versions: SubtitleVersion[];
  currentVersion?: SubtitleVersion;
  onSelectVersion: (version: SubtitleVersion) => void;
  videoName: string;
}

export function SubtitleVersionDialog({
  isOpen,
  onClose,
  versions,
  currentVersion,
  onSelectVersion,
  videoName,
}: SubtitleVersionDialogProps) {
  const [selectedVersion, setSelectedVersion] =
    useState<SubtitleVersion | null>(currentVersion || null);

  useEffect(() => {
    setSelectedVersion(currentVersion || null);
  }, [currentVersion]);

  const handleSelectVersion = (version: SubtitleVersion) => {
    setSelectedVersion(version);
    onSelectVersion(version);
    toast.success(`已选择: ${version.versionName}`);
    onClose();
  };

  const getVersionIcon = (versionType: string) => {
    switch (versionType) {
      case "raw":
        return <FileText className="w-4 h-4" />;
      case "custom":
        return <FileText className="w-4 h-4" />;
      case "optimized":
        return <Star className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getVersionColor = (versionType: string) => {
    switch (versionType) {
      case "raw":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "custom":
        return "bg-green-100 text-green-800 border-green-200";
      case "optimized":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            选择字幕版本 - {videoName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 版本列表 */}
          <div className="grid gap-3">
            {versions.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    暂无字幕版本
                  </h3>
                  <p className="text-gray-600">这个视频还没有任何字幕版本。</p>
                </CardContent>
              </Card>
            ) : (
              versions.map((version) => (
                <Card
                  key={version.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedVersion?.id === version.id
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : ""
                  }`}
                  onClick={() => handleSelectVersion(version)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {getVersionIcon(version.versionType)}
                            <h3 className="font-semibold text-lg">
                              {version.versionName}
                            </h3>
                            {version.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                默认
                              </Badge>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getVersionColor(
                              version.versionType
                            )}`}
                          >
                            {version.versionType === "raw" && "原始"}
                            {version.versionType === "custom" && "自定义"}
                            {version.versionType === "optimized" && "智能分段"}
                          </Badge>
                        </div>

                        {version.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {version.description}
                          </p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">段落数:</span>{" "}
                            {version.metadata?.totalSegments || 0}
                          </div>
                          <div>
                            <span className="font-medium">时长:</span>{" "}
                            {version.metadata?.totalDuration
                              ? formatDuration(version.metadata.totalDuration)
                              : "0:00"}
                          </div>
                          <div>
                            <span className="font-medium">置信度:</span>{" "}
                            {(version.confidence * 100).toFixed(1)}%
                          </div>
                          <div>
                            <span className="font-medium">来源:</span>{" "}
                            {version.source === "assemblyai" && "AssemblyAI"}
                            {version.source === "manual" && "手动"}
                            {version.source === "upload" && "上传"}
                            {version.source === "optimized" && "智能生成"}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(version.createdAt)}
                          </div>
                          {version.updatedAt.getTime() !==
                            version.createdAt.getTime() && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              更新于 {formatDate(version.updatedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            {selectedVersion && (
              <Button onClick={() => handleSelectVersion(selectedVersion)}>
                确认选择
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
