import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Video } from "@/types/video";
import { Subtitle } from "@/types/subtitle";
import { VocabularyItem } from "@/types/vocabulary";

interface AppState {
  // 当前视频
  currentVideo: Video | null;
  // 字幕列表
  subtitles: Subtitle[];
  // 当前播放的字幕
  currentSubtitle: Subtitle | null;
  // 词汇表
  vocabulary: VocabularyItem[];
  // 处理状态
  isProcessing: boolean;
  // 语言设置
  language: string;
  // 播放器状态
  playerState: {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    playbackRate: number;
  };
}

interface AppActions {
  // 视频相关
  setCurrentVideo: (video: Video | null) => void;
  // 字幕相关
  setSubtitles: (subtitles: Subtitle[]) => void;
  setCurrentSubtitle: (subtitle: Subtitle | null) => void;
  // 词汇相关
  setVocabulary: (vocabulary: VocabularyItem[]) => void;
  addVocabularyItem: (item: VocabularyItem) => void;
  removeVocabularyItem: (id: string) => void;
  updateVocabularyItem: (id: string, updates: Partial<VocabularyItem>) => void;
  // 处理状态
  setProcessing: (processing: boolean) => void;
  // 语言设置
  setLanguage: (language: string) => void;
  // 播放器状态
  setPlayerState: (state: Partial<AppState["playerState"]>) => void;
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      // 初始状态
      currentVideo: null,
      subtitles: [],
      currentSubtitle: null,
      vocabulary: [],
      isProcessing: false,
      language: "en",
      playerState: {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        playbackRate: 1,
      },

      // 视频相关
      setCurrentVideo: (video) => set({ currentVideo: video }),

      // 字幕相关
      setSubtitles: (subtitles) => set({ subtitles }),
      setCurrentSubtitle: (subtitle) => set({ currentSubtitle: subtitle }),

      // 词汇相关
      setVocabulary: (vocabulary) => set({ vocabulary }),

      addVocabularyItem: (item) =>
        set((state) => ({
          vocabulary: [...state.vocabulary, item],
        })),

      removeVocabularyItem: (id) =>
        set((state) => ({
          vocabulary: state.vocabulary.filter((item) => item.id !== id),
        })),

      updateVocabularyItem: (id, updates) =>
        set((state) => ({
          vocabulary: state.vocabulary.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

      // 处理状态
      setProcessing: (processing) => set({ isProcessing: processing }),

      // 语言设置
      setLanguage: (language) => set({ language }),

      // 播放器状态
      setPlayerState: (state) =>
        set((currentState) => ({
          playerState: { ...currentState.playerState, ...state },
        })),
    }),
    {
      name: "language-learning-storage",
      storage: createJSONStorage(() => localStorage),
      // 只持久化重要数据，不持久化临时状态
      partialize: (state) => ({
        vocabulary: state.vocabulary,
        language: state.language,
        playerState: {
          volume: state.playerState.volume,
          playbackRate: state.playerState.playbackRate,
        },
      }),
      // 数据恢复时的转换逻辑
      onRehydrateStorage: () => (state) => {
        if (state?.vocabulary) {
          // 将字符串日期转换为 Date 对象
          state.vocabulary = state.vocabulary.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt),
            lastReviewed: item.lastReviewed
              ? new Date(item.lastReviewed)
              : undefined,
          }));
        }
      },
    }
  )
);
