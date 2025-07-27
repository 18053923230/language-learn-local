export interface Video {
  id: string;
  name: string;
  url: string;
  duration: number;
  size: number;
  format: string;
  language: string;
  uploadedAt: Date;
  processed: boolean;
  file?: File; // Optional file reference for transcription
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isFullscreen: boolean;
}
