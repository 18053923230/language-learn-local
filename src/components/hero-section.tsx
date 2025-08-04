"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeroSectionProps {
  onFileUpload: (file: File) => void;
}

export function HeroSection({ onFileUpload }: HeroSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Call the parent handler
    onFileUpload(file);

    // Simulate processing
    setTimeout(() => {
      setIsUploading(false);
      // Navigate to the main page where video processing happens
      router.push("/");
    }, 2000);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            The Future of Language Learning
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Master English with
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Any Video
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform any video into an interactive language learning
            experience. Click subtitles, practice pronunciation, and build
            vocabulary naturally.
            <span className="block text-blue-600 font-semibold mt-2">
              All processing happens locally for complete privacy.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg px-8 py-4"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Your Video
            </Button>
            <input
              id="file-upload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Link href="/how-it-works">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                <Play className="w-5 h-5 mr-2" />
                See How It Works
              </Button>
            </Link>
          </div>

          {isUploading && (
            <div className="max-w-md mx-auto">
              <Progress value={65} className="mb-2" />
              <p className="text-sm text-gray-600">Processing your video...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
