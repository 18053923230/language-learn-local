"use client";

import { useState, useEffect } from "react";
import { rawTranscriptionStorage } from "@/lib/raw-transcription-storage";
import { RawTranscriptionData } from "@/types/raw-transcription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DebugStoragePage() {
  const [allData, setAllData] = useState<RawTranscriptionData[]>([]);
  const [stats, setStats] = useState<{
    totalRecords: number;
    totalSize: number;
    averageConfidence: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await rawTranscriptionStorage.getAllRawData();
      const storageStats = await rawTranscriptionStorage.getStorageStats();

      setAllData(data);
      setStats(storageStats);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    if (
      confirm(
        "Are you sure you want to clear all raw transcription data? This action cannot be undone."
      )
    ) {
      try {
        await rawTranscriptionStorage.clearAll();
        await loadData();
        alert("All data cleared successfully");
      } catch (error) {
        console.error("Error clearing data:", error);
        alert("Error clearing data");
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Loading storage data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Raw Transcription Storage Debug</h1>
        <div className="space-x-2">
          <Button onClick={loadData} variant="outline">
            Refresh
          </Button>
          <Button onClick={clearAllData} variant="destructive">
            Clear All Data
          </Button>
        </div>
      </div>

      {/* Storage Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Storage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalRecords}
                </div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatBytes(stats.totalSize)}
                </div>
                <div className="text-sm text-gray-600">Total Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(stats.averageConfidence * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Avg Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data List */}
      <Card>
        <CardHeader>
          <CardTitle>Stored Raw Transcription Data</CardTitle>
        </CardHeader>
        <CardContent>
          {allData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No raw transcription data found.</p>
              <p className="text-sm mt-2">
                Upload an audio file to generate transcription data.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allData.map((data) => (
                <Card key={data.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {data.videoId}
                        </h3>
                        <p className="text-sm text-gray-600">ID: {data.id}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{data.language}</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(data.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Words:</span>{" "}
                        {data.metadata.totalWords}
                      </div>
                      <div>
                        <span className="font-medium">Utterances:</span>{" "}
                        {data.metadata.totalUtterances}
                      </div>
                      <div>
                        <span className="font-medium">Confidence:</span>{" "}
                        {(data.metadata.averageConfidence * 100).toFixed(1)}%
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>{" "}
                        {data.metadata.audioDuration.toFixed(1)}s
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      <p>Processing Time: {data.metadata.processingTime}ms</p>
                      <p>Model: {data.metadata.modelVersion}</p>
                    </div>

                    {/* Raw Data Preview */}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                        View Raw AssemblyAI Data
                      </summary>
                      <div className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                        <pre>{JSON.stringify(data.assemblyData, null, 2)}</pre>
                      </div>
                    </details>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
