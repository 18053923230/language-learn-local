"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Subtitle } from "@/types/subtitle";
import { Button } from "@/components/ui/button";
import { Search, Play, Volume2, Edit, Download, Settings } from "lucide-react";
import { SubtitleEditor } from "./subtitle-editor";
import { SubtitleExporter } from "@/lib/subtitle-export";

interface SubtitleListProps {
  onSubtitleClick?: (subtitle: Subtitle) => void;
  onPlaySegment?: (start: number, end: number) => void;
}

export function SubtitleList({
  onSubtitleClick,
  onPlaySegment,
}: SubtitleListProps) {
  const { subtitles, currentSubtitle, playerState, setSubtitles } =
    useAppStore();
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
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Subtitles</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportDialog(!showExportDialog)}
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search subtitles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Export Dialog */}
        {showExportDialog && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium mb-2">Export Format:</div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportSubtitles("srt")}
              >
                SRT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportSubtitles("vtt")}
              >
                VTT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportSubtitles("txt")}
              >
                TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportSubtitles("json")}
              >
                JSON
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Subtitle List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSubtitles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm
              ? "No subtitles found matching your search."
              : "No subtitles available."}
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredSubtitles.map((subtitle) => {
              const isCurrent = isCurrentSubtitle(subtitle);
              const isPlaying = isPlayingInRange(subtitle);

              return (
                <div
                  key={subtitle.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 ${
                    isCurrent
                      ? "bg-blue-50 border-blue-200"
                      : isPlaying
                      ? "bg-green-50 border-green-200"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleSubtitleClick(subtitle)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs text-gray-500 font-mono">
                          {formatTime(subtitle.start)} -{" "}
                          {formatTime(subtitle.end)}
                        </span>
                        {subtitle.confidence && (
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              subtitle.confidence > 0.8
                                ? "bg-green-100 text-green-800"
                                : subtitle.confidence > 0.6
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {Math.round(subtitle.confidence * 100)}%
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm leading-relaxed ${
                          isCurrent ? "font-medium" : ""
                        }`}
                      >
                        {subtitle.text}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlaySegment?.(subtitle.start, subtitle.end);
                        }}
                        className="text-gray-500 hover:text-blue-600"
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
                        className="text-gray-500 hover:text-orange-600"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement text-to-speech for this subtitle
                        }}
                        className="text-gray-500 hover:text-green-600"
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="p-3 border-t bg-gray-50 text-xs text-gray-600">
        {filteredSubtitles.length} of {subtitles.length} subtitles
        {searchTerm && ` matching "${searchTerm}"`}
      </div>

      {/* Subtitle Editor Modal */}
      {editingSubtitle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <SubtitleEditor
              subtitle={editingSubtitle}
              onSave={handleSaveSubtitle}
              onCancel={() => setEditingSubtitle(null)}
              onPlaySegment={onPlaySegment}
            />
          </div>
        </div>
      )}
    </div>
  );
}
