"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Subtitle } from "@/types/subtitle";
import { Button } from "@/components/ui/button";
import {
  Search,
  Play,
  Volume2,
  Edit,
  Download,
  Settings,
  Trash2,
} from "lucide-react";
import { SubtitleEditor } from "./subtitle-editor";
import { SubtitleExporter } from "@/lib/subtitle-export";
import { SubtitleSaveButton } from "./subtitle-save-button";
import { VideoGenerationButton } from "./video-generation-button";
import { VideoSegmentGenerationButton } from "./video-segment-generation-button";
import { SmartVideoSegmentButton } from "./smart-video-segment-button";
import { toast } from "sonner";

interface SubtitleListProps {
  onSubtitleClick?: (subtitle: Subtitle) => void;
  onPlaySegment?: (start: number, end: number) => void;
}

export function SubtitleList({
  onSubtitleClick,
  onPlaySegment,
}: SubtitleListProps) {
  const {
    subtitles,
    currentSubtitle,
    playerState,
    setSubtitles,
    currentVideo,
  } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSubtitles, setFilteredSubtitles] = useState<Subtitle[]>([]);
  const [editingSubtitle, setEditingSubtitle] = useState<Subtitle | null>(null);

  const [showExportDialog, setShowExportDialog] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSubtitles(subtitles);
    } else {
      const filtered = subtitles.filter((subtitle) =>
        subtitle.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSubtitles(filtered);
    }
  }, [subtitles, searchTerm]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
  };

  const handleSubtitleClick = (subtitle: Subtitle) => {
    onSubtitleClick?.(subtitle);
    onPlaySegment?.(subtitle.start, subtitle.end);
  };

  const handleEditSubtitle = (subtitle: Subtitle) => {
    setEditingSubtitle(subtitle);
  };

  const handleSaveSubtitle = (updatedSubtitle: Subtitle) => {
    const updatedSubtitles = subtitles.map((sub) =>
      sub.id === updatedSubtitle.id ? updatedSubtitle : sub
    );
    setSubtitles(updatedSubtitles);
    setEditingSubtitle(null);
  };

  const handleExportSubtitles = (format: "srt" | "vtt" | "txt" | "json") => {
    const content = SubtitleExporter.exportSubtitles(subtitles, { format });
    const filename = SubtitleExporter.getFilename("video", format);
    SubtitleExporter.downloadSubtitles(content, filename);
  };

  const handleDeleteSubtitle = (id: string) => {
    const subtitle = subtitles.find((sub) => sub.id === id);
    if (!subtitle) return;

    const confirmed = confirm(
      `Are you sure you want to delete this subtitle?\n\n"${subtitle.text}"\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      setSubtitles(subtitles.filter((sub) => sub.id !== id));
      setEditingSubtitle(null);
      toast.success("Subtitle deleted successfully");
    }
  };

  const isCurrentSubtitle = (subtitle: Subtitle) => {
    if (!currentSubtitle) return false;
    return subtitle.id === currentSubtitle.id;
  };

  const isPlayingInRange = (subtitle: Subtitle) => {
    const currentTime = playerState.currentTime;
    return currentTime >= subtitle.start && currentTime <= subtitle.end;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Search and Export */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-xs font-bold">📝</span>
            </span>
            Subtitles
          </h3>
          <div className="flex items-center space-x-2">
            {currentVideo && (
              <SubtitleSaveButton video={currentVideo} subtitles={subtitles} />
            )}
            {/* {currentVideo && filteredSubtitles.length > 0 && (
              <>
                <VideoGenerationButton
                  subtitles={subtitles}
                  filteredSubtitles={filteredSubtitles}
                  currentVideo={currentVideo}
                  searchTerm={searchTerm}
                />
                <VideoSegmentGenerationButton
                  subtitles={subtitles}
                  filteredSubtitles={filteredSubtitles}
                  currentVideo={currentVideo}
                  searchTerm={searchTerm}
                />
                <SmartVideoSegmentButton
                  subtitles={subtitles}
                  filteredSubtitles={filteredSubtitles}
                  currentVideo={currentVideo}
                  searchTerm={searchTerm}
                />
              </>
            )} */}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search subtitles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="education-input w-full pl-12 pr-4 py-3"
          />
        </div>
      </div>

      {/* Subtitle Count */}
      {subtitles.length > 0 && (
        <div className="px-6 py-3 bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 font-medium">
              {searchTerm
                ? `${filteredSubtitles.length} of ${subtitles.length}`
                : `${subtitles.length}`}{" "}
              subtitles
            </span>
            {searchTerm && (
              <span className="text-green-600 font-medium">
                Filtered by &quot;{searchTerm}&quot;
              </span>
            )}
          </div>
        </div>
      )}

      {/* Subtitle List */}
      <div className="flex-1 overflow-y-auto">
        {subtitles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-400 text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Subtitles Yet
            </h3>
            <p className="text-gray-600 max-w-sm">
              Upload a video and generate subtitles to start learning. The
              subtitles will appear here for easy navigation.
            </p>
          </div>
        ) : filteredSubtitles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Matching Subtitles
            </h3>
            <p className="text-gray-600 max-w-sm">
              Try adjusting your search terms to find the subtitles you&apos;re
              looking for.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredSubtitles.map((subtitle, index) => {
              const isCurrent = currentSubtitle?.id === subtitle.id;
              const isPlaying =
                playerState.isPlaying &&
                playerState.currentTime >= subtitle.start &&
                playerState.currentTime <= subtitle.end;

              // Calculate position in total subtitles
              const totalIndex =
                subtitles.findIndex((s) => s.id === subtitle.id) + 1;

              return (
                <div
                  key={subtitle.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isCurrent
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm"
                      : isPlaying
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => handleSubtitleClick(subtitle)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {formatTime(subtitle.start)} -{" "}
                          {formatTime(subtitle.end)}
                        </span>
                        <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                          {totalIndex}/{subtitles.length}
                        </span>
                        {subtitle.confidence && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              subtitle.confidence > 0.8
                                ? "bg-green-100 text-green-700"
                                : subtitle.confidence > 0.6
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {Math.round(subtitle.confidence * 100)}%
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            Current
                          </span>
                        )}
                        {isPlaying && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium animate-pulse">
                            Playing
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-gray-800 line-clamp-2">
                        {subtitle.text}
                      </p>
                    </div>
                    <div className="ml-3 flex flex-col space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlaySegment?.(subtitle.start, subtitle.end);
                        }}
                        className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
                      >
                        <Play className="w-3 h-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSubtitle(subtitle);
                        }}
                        className="h-8 w-8 p-0 hover:bg-orange-100 text-orange-600"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubtitle(subtitle.id);
                        }}
                        className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Export Subtitles</h3>
            <div className="space-y-3">
              <Button
                onClick={() => handleExportSubtitles("srt")}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as SRT
              </Button>
              <Button
                onClick={() => handleExportSubtitles("vtt")}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as VTT
              </Button>
              <Button
                onClick={() => handleExportSubtitles("txt")}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as TXT
              </Button>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Subtitle Editor Modal */}
      {editingSubtitle && (
        <div className="mt-6">
          <SubtitleEditor
            subtitle={editingSubtitle}
            onSave={handleSaveSubtitle}
            onCancel={() => setEditingSubtitle(null)}
            onPlaySegment={onPlaySegment}
          />
        </div>
      )}
    </div>
  );
}
