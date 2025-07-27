"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Download,
  Eye,
  Search,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { subtitleStorage, SubtitleRecord } from "@/lib/subtitle-storage";
import { SubtitleExporter } from "@/lib/subtitle-export";
import { toast } from "sonner";
import Link from "next/link";

export default function SubtitlesPage() {
  const [records, setRecords] = useState<SubtitleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState<SubtitleRecord[]>([]);
  const [stats, setStats] = useState<{
    totalRecords: number;
    totalSize: number;
    languages: string[];
    sources: { [key: string]: number };
  } | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRecords(records);
    } else {
      const filtered = records.filter(
        (record) =>
          record.videoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.language.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecords(filtered);
    }
  }, [records, searchTerm]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const allRecords = await subtitleStorage.getAllSubtitleRecords();
      const storageStats = await subtitleStorage.getStorageStats();

      setRecords(allRecords);
      setStats(storageStats);
    } catch (error) {
      console.error("Error loading records:", error);
      toast.error("Failed to load subtitle records");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this subtitle record?"))
      return;

    try {
      await subtitleStorage.deleteSubtitleRecord(recordId);
      toast.success("Subtitle record deleted");
      loadRecords(); // 重新加载
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("删除失败");
    }
  };

  const handleExportRecord = (
    record: SubtitleRecord,
    format: "srt" | "vtt" | "txt" | "json"
  ) => {
    try {
      const content = SubtitleExporter.exportSubtitles(record.subtitles, {
        format,
      });
      const filename = SubtitleExporter.getFilename(record.videoName, format);
      SubtitleExporter.downloadSubtitles(content, filename);
      toast.success("Subtitles exported");
    } catch (error) {
      console.error("Error exporting subtitles:", error);
      toast.error("Export failed");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSourceLabel = (source: string) => {
    const labels: { [key: string]: string } = {
      assemblyai: "AssemblyAI",
      upload: "Upload",
      manual: "Manual",
    };
    return labels[source] || source;
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="education-button-secondary"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Video
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Subtitle Management
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Manage Your Subtitle Library
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              View, search, export, and manage all your saved subtitle records.
              Your learning progress is automatically saved and organized.
            </p>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="education-card p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.totalRecords}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Total Records
                </div>
              </div>
              <div className="education-card p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatFileSize(stats.totalSize)}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Total Size
                </div>
              </div>
              <div className="education-card p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats.languages.length}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Languages
                </div>
              </div>
              <div className="education-card p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {Object.values(stats.sources).reduce(
                    (sum, count) => sum + count,
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Source Types
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="education-card p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search video name or language..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="education-input w-full pl-12 pr-4 py-4 text-lg"
              />
            </div>
          </div>

          {/* Records Table */}
          <div className="education-card overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading subtitle records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Subtitle Records
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  {searchTerm
                    ? "No matching records found"
                    : "Upload videos and generate subtitles to view and manage them here"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Video Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Language
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Subtitles
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {record.videoName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="education-badge education-badge-info">
                            {record.language}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDuration(record.duration)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {record.subtitles.length} segments
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`education-badge ${
                              record.confidence > 0.8
                                ? "education-badge-success"
                                : record.confidence > 0.6
                                ? "education-badge-warning"
                                : "education-badge-error"
                            }`}
                          >
                            {Math.round(record.confidence * 100)}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="education-badge education-badge-info">
                            {getSourceLabel(record.source)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(record.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExportRecord(record, "srt")}
                              className="h-8 w-8 p-0 hover:bg-green-100 text-green-600"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRecord(record.id)}
                              className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
