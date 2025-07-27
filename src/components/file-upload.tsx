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
    <div className="w-full space-y-6">
      {/* Language Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700 flex items-center">
          <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
            <span className="text-blue-600 text-xs font-bold">🌍</span>
          </span>
          Video Language
        </label>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="education-input h-12 text-left">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg rounded-lg">
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
        className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
          dragActive
            ? "border-blue-500 bg-blue-50/50 shadow-lg"
            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
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

        <div className="space-y-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <FileVideo className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900">
              Upload Video File
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Drag and drop your video file here, or click to browse
            </p>
            <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg inline-block">
              Supported formats: {SUPPORTED_FORMATS.join(", ")} (Max: 500MB)
            </p>
          </div>

          <Button
            onClick={handleBrowseClick}
            className="education-button w-full h-12 text-base font-semibold"
          >
            <Upload className="w-5 h-5 mr-2" />
            Browse Files
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700 font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
