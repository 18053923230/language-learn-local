import { useEffect, useCallback, useRef } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
}

export interface KeyboardShortcutsConfig {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  global?: boolean;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const { shortcuts, enabled = true, global = false } = config;
  const shortcutsRef = useRef(shortcuts);

  // 更新快捷键引用
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  // 检查快捷键是否匹配
  const isShortcutMatch = useCallback(
    (event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrl === event.ctrlKey;
      const shiftMatch = !!shortcut.shift === event.shiftKey;
      const altMatch = !!shortcut.alt === event.altKey;
      const metaMatch = !!shortcut.meta === event.metaKey;

      return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
    },
    []
  );

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (event: Event) => {
      if (!enabled) return;

      const keyboardEvent = event as KeyboardEvent;

      // 如果不在全局模式，检查是否在输入框中
      if (!global) {
        const target = keyboardEvent.target as HTMLElement;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.contentEditable === "true" ||
            target.classList.contains("ProseMirror"))
        ) {
          return;
        }
      }

      // 查找匹配的快捷键
      const matchedShortcut = shortcutsRef.current.find((shortcut) =>
        isShortcutMatch(keyboardEvent, shortcut)
      );

      if (matchedShortcut) {
        if (matchedShortcut.preventDefault !== false) {
          keyboardEvent.preventDefault();
        }
        matchedShortcut.action();
      }
    },
    [enabled, global, isShortcutMatch]
  );

  // 注册事件监听器
  useEffect(() => {
    if (!enabled) return;

    const eventTarget = global ? window : document;
    eventTarget.addEventListener("keydown", handleKeyDown);

    return () => {
      eventTarget.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, global, handleKeyDown]);

  // 获取快捷键列表（用于显示帮助）
  const getShortcutsList = useCallback(() => {
    return shortcutsRef.current.map((shortcut) => ({
      ...shortcut,
      keyCombo: formatKeyCombo(shortcut),
    }));
  }, []);

  return {
    getShortcutsList,
  };
}

// 格式化快捷键显示
function formatKeyCombo(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push("Ctrl");
  if (shortcut.shift) parts.push("Shift");
  if (shortcut.alt) parts.push("Alt");
  if (shortcut.meta) parts.push("⌘");

  parts.push(shortcut.key.toUpperCase());

  return parts.join(" + ");
}

// 预定义的快捷键集合
export const COMMON_SHORTCUTS = {
  // 视频播放控制
  PLAY_PAUSE: { key: " ", description: "播放/暂停" },
  SEEK_FORWARD: { key: "ArrowRight", description: "快进10秒" },
  SEEK_BACKWARD: { key: "ArrowLeft", description: "后退10秒" },
  VOLUME_UP: { key: "ArrowUp", description: "音量增加" },
  VOLUME_DOWN: { key: "ArrowDown", description: "音量减少" },
  MUTE: { key: "m", description: "静音/取消静音" },
  FULLSCREEN: { key: "f", description: "全屏/退出全屏" },

  // 播放速度控制
  SPEED_UP: { key: ">", description: "加快播放速度" },
  SPEED_DOWN: { key: "<", description: "减慢播放速度" },
  SPEED_RESET: { key: "r", description: "重置播放速度" },

  // 字幕控制
  SUBTITLE_TOGGLE: { key: "s", description: "显示/隐藏字幕" },
  SUBTITLE_NEXT: { key: "n", description: "下一个字幕" },
  SUBTITLE_PREV: { key: "p", description: "上一个字幕" },

  // 学习功能
  ADD_TO_VOCABULARY: { key: "v", description: "添加到生词本" },
  OPEN_VOCABULARY: { key: "g", ctrl: true, description: "打开生词本" },
  SEARCH_WORD: { key: "d", description: "查询单词" },

  // 导航
  GO_HOME: { key: "h", description: "返回首页" },
  OPEN_SETTINGS: { key: ",", description: "打开设置" },

  // 文件操作
  OPEN_FILE: { key: "o", ctrl: true, description: "打开文件" },
  SAVE_DATA: { key: "s", ctrl: true, description: "保存数据" },

  // 帮助
  SHOW_HELP: { key: "?", description: "显示帮助" },
  SHOW_SHORTCUTS: { key: "/", description: "显示快捷键" },
} as const;

// 创建视频播放快捷键
export function createVideoShortcuts(controls: {
  playPause: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  setPlaybackRate: (rate: number) => void;
}) {
  return [
    {
      ...COMMON_SHORTCUTS.PLAY_PAUSE,
      action: controls.playPause,
    },
    {
      ...COMMON_SHORTCUTS.SEEK_FORWARD,
      action: () => controls.seek(10),
    },
    {
      ...COMMON_SHORTCUTS.SEEK_BACKWARD,
      action: () => controls.seek(-10),
    },
    {
      ...COMMON_SHORTCUTS.VOLUME_UP,
      action: () => controls.setVolume(0.1),
    },
    {
      ...COMMON_SHORTCUTS.VOLUME_DOWN,
      action: () => controls.setVolume(-0.1),
    },
    {
      ...COMMON_SHORTCUTS.MUTE,
      action: controls.toggleMute,
    },
    {
      ...COMMON_SHORTCUTS.FULLSCREEN,
      action: controls.toggleFullscreen,
    },
    {
      ...COMMON_SHORTCUTS.SPEED_UP,
      action: () => controls.setPlaybackRate(0.25),
    },
    {
      ...COMMON_SHORTCUTS.SPEED_DOWN,
      action: () => controls.setPlaybackRate(-0.25),
    },
    {
      ...COMMON_SHORTCUTS.SPEED_RESET,
      action: () => controls.setPlaybackRate(1),
    },
  ];
}

// 创建学习快捷键
export function createLearningShortcuts(actions: {
  addToVocabulary: () => void;
  openVocabulary: () => void;
  searchWord: () => void;
}) {
  return [
    {
      ...COMMON_SHORTCUTS.ADD_TO_VOCABULARY,
      action: actions.addToVocabulary,
    },
    {
      ...COMMON_SHORTCUTS.OPEN_VOCABULARY,
      action: actions.openVocabulary,
    },
    {
      ...COMMON_SHORTCUTS.SEARCH_WORD,
      action: actions.searchWord,
    },
  ];
}

// 创建导航快捷键
export function createNavigationShortcuts(actions: {
  goHome: () => void;
  openSettings: () => void;
}) {
  return [
    {
      ...COMMON_SHORTCUTS.GO_HOME,
      action: actions.goHome,
    },
    {
      ...COMMON_SHORTCUTS.OPEN_SETTINGS,
      action: actions.openSettings,
    },
  ];
}
