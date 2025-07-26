"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Upload, FileVideo, AlertCircle } from "lucide-react";

const SUPPORTED_FORMATS = ["mp4", "avi", "mov", "mkv", "webm"];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
];

interface FileUploadProps {
  onFileSelect: (file: File, language: string) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !SUPPORTED_FORMATS.includes(extension)) {
      return `Unsupported file format. Supported formats: ${SUPPORTED_FORMATS.join(
        ", "
      )}`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size too large. Maximum size: ${Math.round(
        MAX_FILE_SIZE / 1024 / 1024
      )}MB`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    onFileSelect(file, selectedLanguage);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Language Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Video Language
        </label>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                {language.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <FileVideo className="w-6 h-6 text-gray-600" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              Upload Video File
            </h3>
            <p className="text-sm text-gray-500">
              Drag and drop your video file here, or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: {SUPPORTED_FORMATS.join(", ")} (Max: 500MB)
            </p>
          </div>

          <Button onClick={handleBrowseClick} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Browse Files
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}
    </div>
  );
}
