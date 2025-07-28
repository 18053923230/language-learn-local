"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Video,
  Trash2,
  Download,
  Eye,
  FileText,
  HardDrive,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { videoStorageService } from "@/lib/video-storage";
import { toast } from "sonner";
import Link from "next/link";

interface VideoFileRecord {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  path: string;
  uploadedAt: Date;
  lastAccessed: Date;
  metadata?: {
    duration?: number;
    resolution?: string;
    bitrate?: number;
  };
}

export default function VideoManagementPage() {
  const [videoFiles, setVideoFiles] = useState<VideoFileRecord[]>([]);
  const [storageStats, setStorageStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadVideoFiles();
    loadStorageStats();
  }, []);

  const loadVideoFiles = async () => {
    try {
      setIsLoading(true);
      const files = await videoStorageService.getAllVideoFiles();
      setVideoFiles(files);
    } catch (error) {
      console.error("Error loading video files:", error);
      toast.error("Failed to load video files");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStorageStats = async () => {
    try {
      const stats = await videoStorageService.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error("Error loading storage stats:", error);
    }
  };

  const handleDeleteFile = async (videoId: string) => {
    try {
      const success = await videoStorageService.deleteVideoFile(videoId);
      if (success) {
        toast.success("Video file deleted successfully");
        await loadVideoFiles();
        await loadStorageStats();
      } else {
        toast.error("Failed to delete video file");
      }
    } catch (error) {
      console.error("Error deleting video file:", error);
      toast.error("Error deleting video file");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) {
      toast.error("Please select files to delete");
      return;
    }

    try {
      let deletedCount = 0;
      for (const videoId of selectedFiles) {
        const success = await videoStorageService.deleteVideoFile(videoId);
        if (success) deletedCount++;
      }

      toast.success(`${deletedCount} video files deleted successfully`);
      setSelectedFiles(new Set());
      await loadVideoFiles();
      await loadStorageStats();
    } catch (error) {
      console.error("Error deleting selected files:", error);
      toast.error("Error deleting selected files");
    }
  };

  const handleCleanupOldFiles = async () => {
    try {
      const deletedCount = await videoStorageService.cleanupOldFiles(30);
      if (deletedCount > 0) {
        toast.success(`${deletedCount} old video files cleaned up`);
        await loadVideoFiles();
        await loadStorageStats();
      } else {
        toast.info("No old files to clean up");
      }
    } catch (error) {
      console.error("Error cleaning up old files:", error);
      toast.error("Error cleaning up old files");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const toggleFileSelection = (videoId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedFiles(newSelected);
  };

  const selectAllFiles = () => {
    if (selectedFiles.size === videoFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(videoFiles.map((f) => f.id)));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Video Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your stored video files and storage space
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/video-search">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Video Search
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Video className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Storage Stats */}
        {storageStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="education-card p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {storageStats.totalFiles}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Total Files
              </div>
            </div>
            <div className="education-card p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatFileSize(storageStats.totalSize)}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Total Size
              </div>
            </div>
            <div className="education-card p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {formatFileSize(storageStats.averageFileSize)}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Avg File Size
              </div>
            </div>
            <div className="education-card p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {storageStats.newestFile
                  ? formatDate(storageStats.newestFile)
                  : "N/A"}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Latest Upload
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="education-card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllFiles}
                disabled={videoFiles.length === 0}
              >
                {selectedFiles.size === videoFiles.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
              {selectedFiles.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedFiles.size})
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCleanupOldFiles}
              >
                <Clock className="w-4 h-4 mr-2" />
                Cleanup Old Files
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadVideoFiles}
                disabled={isLoading}
              >
                <HardDrive className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Video Files List */}
        <div className="education-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Stored Video Files ({videoFiles.length})
          </h2>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading video files...</p>
            </div>
          ) : videoFiles.length === 0 ? (
            <div className="text-center py-8">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No video files stored yet</p>
              <Link href="/">
                <Button>
                  <Video className="w-4 h-4 mr-2" />
                  Upload Your First Video
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {videoFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.id)}
                    onChange={() => toggleFileSelection(file.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Video className="w-4 h-4 text-blue-600" />
                      <h3 className="font-medium text-gray-900 truncate">
                        {file.originalName}
                      </h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {file.type}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <HardDrive className="w-3 h-3" />
                        <span>{formatFileSize(file.size)}</span>
                      </span>
                      {file.metadata?.duration && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(file.metadata.duration)}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Info className="w-3 h-3" />
                        <span>Uploaded {formatDate(file.uploadedAt)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
                      title="View details"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-green-100 text-green-600"
                      title="Download"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                      onClick={() => handleDeleteFile(file.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
