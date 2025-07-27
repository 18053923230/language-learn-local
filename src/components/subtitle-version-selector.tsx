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
import {
  SubtitleVersion,
  SubtitleVersionSelection,
} from "@/types/subtitle-version";
import { FileText, Edit, Star, Clock, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface SubtitleVersionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selection: SubtitleVersionSelection;
}

export function SubtitleVersionSelector({
  isOpen,
  onClose,
  selection,
}: SubtitleVersionSelectorProps) {
  const [selectedVersion, setSelectedVersion] =
    useState<SubtitleVersion | null>(selection.currentVersion || null);

  useEffect(() => {
    setSelectedVersion(selection.currentVersion || null);
  }, [selection.currentVersion]);

  const handleSelectVersion = (version: SubtitleVersion) => {
    setSelectedVersion(version);
    selection.onSelect(version);
    toast.success(`已选择: ${version.versionName}`);
    onClose();
  };

  const handleCreateNew = () => {
    selection.onCreateNew();
    onClose();
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!confirm("确定要删除这个字幕版本吗？此操作不可撤销。")) {
      return;
    }

    try {
      selection.onDelete?.(versionId);
      toast.success("字幕版本已删除");
    } catch (error) {
      console.error("Error deleting version:", error);
      toast.error("删除失败");
    }
  };

  const getVersionIcon = (versionType: string) => {
    switch (versionType) {
      case "raw":
        return <FileText className="w-4 h-4" />;
      case "custom":
        return <Edit className="w-4 h-4" />;
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
    }).format(date);
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
            选择字幕版本
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 版本列表 */}
          <div className="grid gap-3">
            {selection.availableVersions.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    暂无字幕版本
                  </h3>
                  <p className="text-gray-600 mb-4">
                    这个视频还没有任何字幕版本，请先创建字幕。
                  </p>
                  <Button onClick={handleCreateNew} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    创建新字幕
                  </Button>
                </CardContent>
              </Card>
            ) : (
              selection.availableVersions.map((version) => (
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
                            {version.versionType === "optimized" && "优化"}
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
                            {version.source === "optimized" && "优化"}
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
                              <Edit className="w-3 h-3" />
                              更新于 {formatDate(version.updatedAt)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {selection.onDelete &&
                          version.versionType !== "raw" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteVersion(version.id);
                              }}
                              className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* 操作按钮 */}
          {selection.availableVersions.length > 0 && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                创建新版本
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
