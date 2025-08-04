"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Keyboard,
  Video,
  BookOpen,
  Settings,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { COMMON_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";

export default function HelpPage() {
  const formatKeyCombo = (shortcut: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    key: string;
  }): string => {
    const parts: string[] = [];

    if (shortcut.ctrl) parts.push("Ctrl");
    if (shortcut.shift) parts.push("Shift");
    if (shortcut.alt) parts.push("Alt");
    if (shortcut.meta) parts.push("⌘");

    parts.push(shortcut.key.toUpperCase());

    return parts.join(" + ");
  };

  const shortcuts = [
    {
      ...COMMON_SHORTCUTS.PLAY_PAUSE,
      keyCombo: formatKeyCombo(COMMON_SHORTCUTS.PLAY_PAUSE),
    },
    {
      ...COMMON_SHORTCUTS.SEEK_FORWARD,
      keyCombo: formatKeyCombo(COMMON_SHORTCUTS.SEEK_FORWARD),
    },
    {
      ...COMMON_SHORTCUTS.SEEK_BACKWARD,
      keyCombo: formatKeyCombo(COMMON_SHORTCUTS.SEEK_BACKWARD),
    },
    {
      ...COMMON_SHORTCUTS.VOLUME_UP,
      keyCombo: formatKeyCombo(COMMON_SHORTCUTS.VOLUME_UP),
    },
    {
      ...COMMON_SHORTCUTS.VOLUME_DOWN,
      keyCombo: formatKeyCombo(COMMON_SHORTCUTS.VOLUME_DOWN),
    },
    {
      ...COMMON_SHORTCUTS.MUTE,
      keyCombo: formatKeyCombo(COMMON_SHORTCUTS.MUTE),
    },
    {
      ...COMMON_SHORTCUTS.FULLSCREEN,
      keyCombo: formatKeyCombo(COMMON_SHORTCUTS.FULLSCREEN),
    },
    {
      ...COMMON_SHORTCUTS.SPEED_UP,
      keyCombo: formatKeyCombo(COMMON_SHORTCUTS.SPEED_UP),
    },
    {
      ...COMMON_SHORTCUTS.SPEED_DOWN,
      keyCombo: formatKeyCombo(COMMON_SHORTCUTS.SPEED_DOWN),
    },
    {
      ...COMMON_SHORTCUTS.SPEED_RESET,
      keyCombo: formatKeyCombo(COMMON_SHORTCUTS.SPEED_RESET),
    },
    {
      ...COMMON_SHORTCUTS.ADD_TO_VOCABULARY,
      keyCombo: formatKeyCombo(COMMON_SHORTCUTS.ADD_TO_VOCABULARY),
    },
    {
      ...COMMON_SHORTCUTS.OPEN_VOCABULARY,
      keyCombo: formatKeyCombo(COMMON_SHORTCUTS.OPEN_VOCABULARY),
    },
    {
      ...COMMON_SHORTCUTS.SEARCH_WORD,
      keyCombo: formatKeyCombo(COMMON_SHORTCUTS.SEARCH_WORD),
    },
    {
      ...COMMON_SHORTCUTS.GO_HOME,
      keyCombo: formatKeyCombo(COMMON_SHORTCUTS.GO_HOME),
    },
    {
      ...COMMON_SHORTCUTS.OPEN_SETTINGS,
      keyCombo: formatKeyCombo(COMMON_SHORTCUTS.OPEN_SETTINGS),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Video
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                Help & Shortcuts
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-8">
          {/* Getting Started */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Upload a Video</h3>
                  <p className="text-gray-600 text-sm">
                    Click the upload area on the homepage and select a video
                    file. Supported formats: MP4, AVI, MOV, MKV, and more.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Choose Language</h3>
                  <p className="text-gray-600 text-sm">
                    Select the language of your video for accurate subtitle
                    generation.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Wait for Processing</h3>
                  <p className="text-gray-600 text-sm">
                    The system will automatically generate subtitles using
                    speech recognition. This may take a few minutes depending on
                    video length.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-medium">Start Learning</h3>
                  <p className="text-gray-600 text-sm">
                    Use the video player controls, subtitle list, and vocabulary
                    features to enhance your language learning experience.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Features Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Video className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium">Video Player</h3>
                  <p className="text-gray-600 text-sm">
                    Advanced video controls with playback speed adjustment,
                    volume control, and fullscreen support.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <BookOpen className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-medium">Vocabulary Learning</h3>
                  <p className="text-gray-600 text-sm">
                    Add words to your vocabulary, look up definitions, and track
                    your learning progress.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Settings className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-medium">Data Management</h3>
                  <p className="text-gray-600 text-sm">
                    Backup and restore your data, manage storage, and sync
                    across devices.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Keyboard className="w-6 h-6 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-medium">Keyboard Shortcuts</h3>
                  <p className="text-gray-600 text-sm">
                    Use keyboard shortcuts for quick access to common functions
                    and improved workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Keyboard className="w-5 h-5 mr-2" />
              Keyboard Shortcuts
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video Controls */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  Video Controls
                </h3>
                <div className="space-y-2">
                  {shortcuts.slice(0, 10).map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-1"
                    >
                      <span className="text-sm text-gray-600">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                        {shortcut.keyCombo}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning & Navigation */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  Learning & Navigation
                </h3>
                <div className="space-y-2">
                  {shortcuts.slice(10).map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-1"
                    >
                      <span className="text-sm text-gray-600">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                        {shortcut.keyCombo}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tips & Tricks */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Tips & Tricks</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">
                  🎯 Learning Tips
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • Use the playback speed controls to slow down difficult
                    sections
                  </li>
                  <li>
                    • Click on subtitles to jump to specific parts of the video
                  </li>
                  <li>
                    • Add unfamiliar words to your vocabulary for later review
                  </li>
                  <li>
                    • Use the search function to find specific words in
                    subtitles
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">
                  ⚡ Performance Tips
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>
                    • Keep video files under 100MB for optimal performance
                  </li>
                  <li>• Close unused browser tabs to free up memory</li>
                  <li>• Use hardware acceleration when available</li>
                  <li>• Regularly clear browser cache and storage</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-800 mb-2">
                  🔧 Troubleshooting
                </h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• If video doesn't play, try refreshing the page</li>
                  <li>• Check that your browser supports the video format</li>
                  <li>• Ensure you have sufficient storage space</li>
                  <li>• Contact support if you encounter persistent issues</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                If you need additional help or encounter any issues, please:
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-sm">
                    Check the troubleshooting section above
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-sm">
                    Try refreshing the page or clearing browser cache
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-sm">
                    Contact our support team with detailed information
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
