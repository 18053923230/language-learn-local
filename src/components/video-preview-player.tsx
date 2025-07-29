"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface VideoPreviewPlayerProps {
  videoFile: File;
  startTime: number;
  endTime: number;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoPreviewPlayer({
  videoFile,
  startTime,
  endTime,
  isOpen,
  onClose,
}: VideoPreviewPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 使用 Data URL 而不是 Blob URL
  useEffect(() => {
    console.log("Creating video URL for file:", videoFile.name, videoFile.type);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      console.log("Data URL created successfully");
      setVideoUrl(dataUrl);
    };
    reader.onerror = () => {
      console.error("Failed to create data URL:", reader.error);
      setHasError(true);
      setErrorMessage("Failed to load video file");
    };
    reader.readAsDataURL(videoFile);
  }, [videoFile]);

  useEffect(() => {
    console.log("VideoPreviewPlayer: isOpen changed to", isOpen);
    if (isOpen && videoRef.current && videoUrl) {
      console.log("Setting video currentTime to", startTime);
      // 延迟设置 currentTime，确保视频已加载
      const timer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = startTime;
          setCurrentTime(startTime);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, startTime, videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);

      // 如果播放到结束时间，停止播放并重置到开始时间
      if (video.currentTime >= endTime) {
        console.log("Reached end time, stopping and resetting");
        video.pause();
        setIsPlaying(false);
        video.currentTime = startTime;
        setCurrentTime(startTime);
      }
    };

    const handleSeeked = () => {
      // 确保在用户手动拖动进度条后，如果超过结束时间，立即重置
      if (video.currentTime >= endTime) {
        console.log("Seeked past end time, resetting to start");
        video.currentTime = startTime;
        setCurrentTime(startTime);
      }
    };

    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded, duration:", video.duration);
      setDuration(video.duration);
    };

    const handleLoadedData = () => {
      console.log("Video data loaded, setting currentTime to", startTime);
      video.currentTime = startTime;
      setCurrentTime(startTime);
    };

    const handleCanPlay = () => {
      console.log("Video can play, setting currentTime to", startTime);
      // 确保视频从正确的时间开始
      video.currentTime = startTime;
      setCurrentTime(startTime);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        exitFullscreen();
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", handleCanPlay);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", handleCanPlay);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [startTime, endTime, isFullscreen]);

  // 添加额外的定时器来检查播放时间，确保能及时停止
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video && video.currentTime >= endTime) {
        console.log("Interval check: reached end time, stopping");
        video.pause();
        setIsPlaying(false);
        video.currentTime = startTime;
        setCurrentTime(startTime);
      }
    }, 100); // 每100ms检查一次

    return () => clearInterval(interval);
  }, [isPlaying, startTime, endTime]);

  // 不再需要清理 blob URL，因为我们使用 data URL

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) {
      console.log("Video element not found");
      return;
    }

    console.log("Toggle play clicked, current state:", isPlaying);
    if (isPlaying) {
      video.pause();
      console.log("Video paused");
    } else {
      video
        .play()
        .then(() => {
          console.log("Video started playing");
        })
        .catch((error) => {
          console.error("Error playing video:", error);
        });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    // 确保不会超过结束时间
    const clampedTime = Math.min(newTime, endTime);
    video.currentTime = clampedTime;
    setCurrentTime(clampedTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    video.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // 计算在指定时间段内的进度百分比
  const progressPercentage =
    duration > 0
      ? ((currentTime - startTime) / (endTime - startTime)) * 100
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-black">
        <DialogHeader className="p-4 bg-black text-white">
          <DialogTitle className="text-lg font-semibold">
            {videoFile.name} ({formatTime(startTime)} - {formatTime(endTime)})
          </DialogTitle>
        </DialogHeader>

        <div ref={containerRef} className="relative bg-black">
          {hasError ? (
            <div className="w-full h-64 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <div className="text-lg font-semibold mb-2">
                  Video Load Error
                </div>
                <div className="text-sm text-gray-300">{errorMessage}</div>
                <Button
                  onClick={() => {
                    setHasError(false);
                    setErrorMessage("");
                    if (videoRef.current) {
                      videoRef.current.load();
                    }
                  }}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : !videoUrl ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading video...</p>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-auto max-h-[70vh]"
              preload="metadata"
              controls={false}
              onLoadStart={() => console.log("Video load started")}
              onLoadedMetadata={() => console.log("Video metadata loaded")}
              onLoadedData={() => console.log("Video data loaded")}
              onCanPlay={() => console.log("Video can play")}
              onPlay={() => {
                console.log("Video play event fired");
                setIsPlaying(true);
              }}
              onPause={() => {
                console.log("Video pause event fired");
                setIsPlaying(false);
              }}
              onEnded={() => {
                console.log("Video ended event fired");
                setIsPlaying(false);
                if (videoRef.current) {
                  videoRef.current.currentTime = startTime;
                  setCurrentTime(startTime);
                }
              }}
              onError={(e) => {
                console.error("Video error:", e);
                console.error("Video error details:", videoRef.current?.error);
                setHasError(true);
                setErrorMessage("Failed to load video. Please try again.");
              }}
            />
          )}

          {/* Video Controls */}
          {!hasError && videoUrl && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center space-x-4">
                {/* Play/Pause Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>

                {/* Progress Bar */}
                <div className="flex-1">
                  <input
                    type="range"
                    min={startTime}
                    max={endTime}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercentage}%, #4b5563 ${progressPercentage}%, #4b5563 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-white mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(endTime)}</span>
                  </div>
                </div>

                {/* Volume Control */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Fullscreen Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
