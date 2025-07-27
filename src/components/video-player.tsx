"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  RotateCcw,
} from "lucide-react";

interface VideoPlayerProps {
  url: string;
  onProgress?: (currentTime: number, duration: number) => void;
  onDuration?: (duration: number) => void;
  onReady?: () => void;
  onRef?: (ref: VideoPlayerRef) => void;
}

export interface VideoPlayerRef {
  seekTo: (time: number) => void;
  playSegment: (start: number, end: number) => void;
  play: () => void;
  pause: () => void;
  segmentTimer?: NodeJS.Timeout;
  cleanupSegment?: () => void;
}

export function VideoPlayer({
  url,
  onProgress,
  onDuration,
  onReady,
  onRef,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setPlayerState } = useAppStore();

  // 创建播放器引用
  const playerRef = useRef<VideoPlayerRef>({
    seekTo: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
    },
    playSegment: (start: number, end: number) => {
      if (videoRef.current) {
        // 清除之前的定时器
        if (playerRef.current.segmentTimer) {
          clearTimeout(playerRef.current.segmentTimer);
        }

        // 设置播放位置并开始播放
        videoRef.current.currentTime = start;
        setCurrentTime(start);

        videoRef.current.play().catch((err) => {
          console.error("Error playing segment:", err);
        });

        // 设置定时器在结束时暂停
        const segmentDuration = (end - start) * 1000;
        playerRef.current.segmentTimer = setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.pause();
            setPlaying(false);
          }
        }, segmentDuration);

        // 添加时间更新监听器来检查是否到达结束位置
        const checkEndTime = () => {
          if (videoRef.current && videoRef.current.currentTime >= end) {
            videoRef.current.pause();
            setPlaying(false);
            videoRef.current.removeEventListener("timeupdate", checkEndTime);
          }
        };

        videoRef.current.addEventListener("timeupdate", checkEndTime);

        // 保存清理函数
        playerRef.current.cleanupSegment = () => {
          videoRef.current?.removeEventListener("timeupdate", checkEndTime);
          if (playerRef.current.segmentTimer) {
            clearTimeout(playerRef.current.segmentTimer);
          }
        };
      }
    },
    play: () => {
      if (videoRef.current) {
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err);
        });
      }
    },
    pause: () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    },
  });

  // 暴露播放器引用给父组件
  useEffect(() => {
    if (onRef) {
      onRef(playerRef.current);
    }
  }, [onRef]);

  useEffect(() => {
    setPlayerState({
      isPlaying: playing,
      currentTime,
      duration,
      volume: muted ? 0 : volume,
      playbackRate,
    });
  }, [
    playing,
    currentTime,
    duration,
    volume,
    muted,
    playbackRate,
    setPlayerState,
  ]);

  // 当 URL 变化时，重置播放器状态
  useEffect(() => {
    if (url) {
      setPlaying(false);
      setCurrentTime(0);
      setError(null);

      // 清理之前的段落播放
      if (playerRef.current.cleanupSegment) {
        playerRef.current.cleanupSegment();
      }
    }
  }, [url]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (playerRef.current.cleanupSegment) {
        playerRef.current.cleanupSegment();
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err);
          setError("无法播放视频。浏览器可能阻止了自动播放。");
        });
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume > 0 && muted) {
      setMuted(false);
    }
  };

  const handleMuteToggle = () => {
    setMuted(!muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !seeking) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onProgress?.(time, duration);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      onDuration?.(videoDuration);
      // 在元数据加载后设置初始音量和静音状态
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
      onReady?.();
    }
  };

  const handleError = () => {
    setError("加载视频失败。请检查文件或网络连接。");
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handlePlaybackRateChange = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    setPlaybackRate(newRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => {
          alert(
            `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
          );
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group w-full h-full"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={handlePlayPause}
    >
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-contain bg-black"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={handleError}
        controls={false}
        preload="auto"
        crossOrigin="anonymous"
        muted={muted} // 直接使用 state 控制
        onDurationChange={handleLoadedMetadata} // 某些浏览器更早触发这个
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
          <div className="text-white text-center p-4">
            <p className="text-lg font-semibold mb-2">视频错误</p>
            <p className="text-sm">{error}</p>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
              }}
              className="mt-4"
              variant="outline"
            >
              关闭
            </Button>
          </div>
        </div>
      )}

      {/* 点击播放的大按钮 */}
      {!playing && !error && (
        <div
          className="absolute inset-0 flex items-center justify-center z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePlayPause}
            className="text-white bg-black/30 hover:bg-white/20 w-20 h-20 rounded-full"
          >
            <Play className="w-10 h-10 ml-1" />
          </Button>
        </div>
      )}

      {/* 控制条 */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 z-20 ${
          showControls || !playing
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="range"
          min={0}
          max={duration || 1}
          step="any"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-gray-500/50 rounded-lg appearance-none cursor-pointer range-slider"
        />
        <div className="flex justify-between text-white text-xs mt-1.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              className="text-white hover:bg-white/20"
            >
              {playing ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSkip(-10)}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSkip(10)}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMuteToggle}
                className="text-white hover:bg-white/20"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={muted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer range-slider"
              />
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              onClick={handlePlaybackRateChange}
              className="text-white hover:bg-white/20 text-sm font-semibold w-12"
            >
              {playbackRate}x
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              className="text-white hover:bg-white/20"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
