"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Eye, Search } from "lucide-react";
import { subtitleStorage, SubtitleRecord } from "@/lib/subtitle-storage";
import { SubtitleExporter } from "@/lib/subtitle-export";
import { toast } from "sonner";

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
    const labels = {
      assemblyai: "AssemblyAI",
      upload: "Upload",
      manual: "Manual",
    };
    return labels[source as keyof typeof labels] || source;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Subtitle Management
          </h1>
          <p className="text-gray-600">Manage saved subtitle records</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalRecords}
              </div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {formatFileSize(stats.totalSize)}
              </div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                {stats.languages.length}
              </div>
              <div className="text-sm text-gray-600">Languages</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(stats.sources).reduce(
                  (sum, count) => sum + count,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Source Types</div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search video name or language..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Records List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-4">No subtitle records</div>
              <p className="text-sm text-gray-400">
                {searchTerm
                  ? "No matching records found"
                  : "Upload videos and generate subtitles to view and manage them here"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Video Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtitles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {record.videoName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {record.language}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDuration(record.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.subtitles.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            record.confidence > 0.8
                              ? "bg-green-100 text-green-800"
                              : record.confidence > 0.6
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {Math.round(record.confidence * 100)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getSourceLabel(record.source)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(record.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportRecord(record, "srt")}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            SRT
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportRecord(record, "vtt")}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            VTT
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-3 h-3" />
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
    </div>
  );
}
