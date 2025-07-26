"use client";

import { useState } from "react";
import { VideoPlayer } from "@/components/video-player";
import { Button } from "@/components/ui/button";

export default function TestPage() {
  const [testVideoUrl, setTestVideoUrl] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTestVideoUrl(url);
    }
  };

  const handleProgress = (currentTime: number, duration: number) => {
    console.log("Progress:", currentTime, duration);
  };

  const handleDuration = (duration: number) => {
    console.log("Duration:", duration);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Video Player Test</h1>

        <div className="mb-6">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {testVideoUrl && (
          <div className="bg-black rounded-lg overflow-hidden">
            <VideoPlayer
              url={testVideoUrl}
              onProgress={handleProgress}
              onDuration={handleDuration}
            />
          </div>
        )}

        <div className="mt-8 p-4 bg-white rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Test Instructions</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Select a video file using the file input above</li>
            <li>Try clicking the play/pause button</li>
            <li>Test volume controls</li>
            <li>Try seeking with the progress bar</li>
            <li>Test playback speed controls</li>
            <li>Check the debug info in the top-left corner</li>
          </ul>
        </div>

        <div className="mt-4">
          <Button onClick={() => setTestVideoUrl("")} variant="outline">
            Clear Video
          </Button>
        </div>
      </div>
    </div>
  );
}
