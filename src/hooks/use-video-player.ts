import { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/lib/store";

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  buffered: TimeRanges | null;
  readyState: number;
  error: string | null;
}

export interface VideoPlayerControls {
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleMute: () => void;
  skip: (seconds: number) => void;
  toggleFullscreen: () => void;
}

export function useVideoPlayer(videoRef: React.RefObject<HTMLVideoElement>) {
  const { setPlayerState } = useAppStore();
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    buffered: null,
    readyState: 0,
    error: null,
  });

  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // 更新播放器状态到全局store
  useEffect(() => {
    setPlayerState({
      isPlaying: state.isPlaying,
      currentTime: state.currentTime,
      duration: state.duration,
      volume: state.volume,
      playbackRate: state.playbackRate,
    });
  }, [state, setPlayerState]);

  // 播放
  const play = useCallback(async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setState((prev) => ({ ...prev, isPlaying: true, error: null }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to play video";
        setState((prev) => ({ ...prev, error: errorMessage }));
        throw error;
      }
    }
  }, [videoRef]);

  // 暂停
  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, [videoRef]);

  // 跳转到指定时间
  const seek = useCallback(
    (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(
          0,
          Math.min(time, state.duration)
        );
        setState((prev) => ({ ...prev, currentTime: time }));
      }
    },
    [videoRef, state.duration]
  );

  // 设置音量
  const setVolume = useCallback(
    (volume: number) => {
      if (videoRef.current) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        videoRef.current.volume = clampedVolume;
        setState((prev) => ({ ...prev, volume: clampedVolume }));
      }
    },
    [videoRef]
  );

  // 设置播放速度
  const setPlaybackRate = useCallback(
    (rate: number) => {
      if (videoRef.current) {
        videoRef.current.playbackRate = rate;
        setState((prev) => ({ ...prev, playbackRate: rate }));
      }
    },
    [videoRef]
  );

  // 切换静音
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setState((prev) => ({
        ...prev,
        volume: videoRef.current!.muted ? 0 : prev.volume,
      }));
    }
  }, [videoRef]);

  // 跳过指定秒数
  const skip = useCallback(
    (seconds: number) => {
      if (videoRef.current) {
        const newTime = Math.max(
          0,
          Math.min(state.duration, state.currentTime + seconds)
        );
        seek(newTime);
      }
    },
    [videoRef, state.currentTime, state.duration, seek]
  );

  // 切换全屏
  const toggleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch((err) => {
          console.error("Error attempting to enable full-screen mode:", err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  }, [videoRef]);

  // 事件处理器
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const now = Date.now();

      // 限制更新频率，避免过度渲染
      if (now - lastUpdateTimeRef.current > 100) {
        setState((prev) => ({ ...prev, currentTime }));
        lastUpdateTimeRef.current = now;
      }
    }
  }, [videoRef]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setState((prev) => ({
        ...prev,
        duration: videoRef.current!.duration,
        readyState: videoRef.current!.readyState,
      }));
    }
  }, [videoRef]);

  const handlePlay = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: true, error: null }));
  }, []);

  const handlePause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const handleProgress = useCallback(() => {
    if (videoRef.current) {
      setState((prev) => ({ ...prev, buffered: videoRef.current!.buffered }));
    }
  }, [videoRef]);

  const handleError = useCallback(() => {
    if (videoRef.current) {
      const error = videoRef.current.error;
      let errorMessage = "Unknown video error";

      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Video playback was aborted";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Network error occurred";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Video decoding error";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Video format not supported";
            break;
        }
      }

      setState((prev) => ({ ...prev, error: errorMessage, isPlaying: false }));
    }
  }, [videoRef]);

  const handleVolumeChange = useCallback(() => {
    if (videoRef.current) {
      setState((prev) => ({ ...prev, volume: videoRef.current!.volume }));
    }
  }, [videoRef]);

  const handleRateChange = useCallback(() => {
    if (videoRef.current) {
      setState((prev) => ({
        ...prev,
        playbackRate: videoRef.current!.playbackRate,
      }));
    }
  }, [videoRef]);

  // 设置事件监听器
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("error", handleError);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("ratechange", handleRateChange);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("error", handleError);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("ratechange", handleRateChange);
    };
  }, [
    videoRef,
    handleTimeUpdate,
    handleLoadedMetadata,
    handlePlay,
    handlePause,
    handleProgress,
    handleError,
    handleVolumeChange,
    handleRateChange,
  ]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  const controls: VideoPlayerControls = {
    play,
    pause,
    seek,
    setVolume,
    setPlaybackRate,
    toggleMute,
    skip,
    toggleFullscreen,
  };

  return {
    state,
    controls,
  };
}
