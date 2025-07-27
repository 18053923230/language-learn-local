"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AudioProcessor } from "@/lib/audio-processor";
import { assemblyAIService } from "@/lib/assemblyai-service";
import { Subtitle } from "@/types/subtitle";

export default function TestAudioPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioInfo, setAudioInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState<any>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setAudioUrl(null);
    setAudioInfo(null);

    try {
      const audioProcessor = new AudioProcessor();
      await audioProcessor.initialize();

      console.log("Processing video file:", file.name);
      const result = await audioProcessor.extractAudioFromVideo(file, {
        format: "wav",
        sampleRate: 44100,
        channels: 2,
      });

      console.log("Audio extraction result:", result);

      // Create audio URL for playback
      const url = URL.createObjectURL(result.audioBlob);
      setAudioUrl(url);
      setAudioInfo({
        duration: result.duration,
        sampleRate: result.sampleRate,
        channels: result.channels,
        format: result.format,
        size: result.audioBlob.size,
      });

      console.log("Audio URL created:", url);
    } catch (err) {
      console.error("Error processing audio:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

  const testAudioPlayback = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio
        .play()
        .then(() => {
          console.log("Audio playback started successfully");
        })
        .catch((error) => {
          console.error("Audio playback failed:", error);
          setError("Audio playback failed: " + error.message);
        });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const testTranscription = async () => {
    if (!audioUrl || !audioInfo) return;

    setIsTranscribing(true);
    setError(null);
    setSubtitles([]);

    try {
      // Initialize AssemblyAI service
      await assemblyAIService.initialize("en");

      // Create a blob from the audio URL
      const response = await fetch(audioUrl);
      const audioBlob = await response.blob();

      console.log(
        "Starting AssemblyAI transcription with audio blob:",
        audioBlob
      );

      // Start transcription with AssemblyAI
      const result = await assemblyAIService.transcribeAudio(
        audioBlob,
        "test-video-id",
        "en",
        (progress: any) => {
          setTranscriptionProgress(progress);
          console.log("AssemblyAI transcription progress:", progress);
        }
      );

      console.log("AssemblyAI transcription result:", result);
      setSubtitles(result.segments);
    } catch (err) {
      console.error("AssemblyAI transcription error:", err);
      setError(
        err instanceof Error ? err.message : "AssemblyAI transcription failed"
      );
    } finally {
      setIsTranscribing(false);
      setTranscriptionProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Audio Processing Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Video File</h2>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-800">Processing audio...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {audioInfo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-green-800 font-semibold mb-2">
              Audio Information:
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Duration:</span>{" "}
                {audioInfo.duration.toFixed(2)}s
              </div>
              <div>
                <span className="font-medium">Sample Rate:</span>{" "}
                {audioInfo.sampleRate}Hz
              </div>
              <div>
                <span className="font-medium">Channels:</span>{" "}
                {audioInfo.channels}
              </div>
              <div>
                <span className="font-medium">Format:</span> {audioInfo.format}
              </div>
              <div>
                <span className="font-medium">Size:</span>{" "}
                {(audioInfo.size / 1024 / 1024).toFixed(2)}MB
              </div>
            </div>
          </div>
        )}

        {audioUrl && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Audio Playback Test</h2>
            <div className="space-y-4">
              <Button onClick={testAudioPlayback} className="mr-4">
                Test Audio Playback
              </Button>
              <Button
                onClick={testTranscription}
                disabled={isTranscribing}
                className="mr-4"
              >
                {isTranscribing ? "Running AssemblyAI..." : "Test AssemblyAI"}
              </Button>
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        )}

        {/* Transcription Progress */}
        {isTranscribing && transcriptionProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-800 font-medium">
                {transcriptionProgress.message}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${transcriptionProgress.progress}%` }}
              ></div>
            </div>
            {transcriptionProgress.currentSegment && (
              <div className="text-sm text-blue-700 mt-1">
                Segment {transcriptionProgress.currentSegment} of{" "}
                {transcriptionProgress.totalSegments}
              </div>
            )}
          </div>
        )}

        {/* Subtitles Display */}
        {subtitles.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Generated Subtitles</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {subtitles.map((subtitle, index) => (
                <div
                  key={subtitle.id}
                  className="p-3 bg-gray-50 rounded border"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm text-gray-500">
                      {formatTime(subtitle.start)} - {formatTime(subtitle.end)}
                    </span>
                    <span className="text-xs text-gray-400">
                      Confidence: {(subtitle.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-gray-900">{subtitle.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Total segments: {subtitles.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
