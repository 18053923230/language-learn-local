"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Play,
  Settings,
  List,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Language = "zh" | "ja" | "ko" | "en";

const helpContent = {
  zh: {
    title: "如何开始学习？",
    subtitle: "完整的视频语言学习指南",
    steps: [
      {
        title: "1. 获取学习视频",
        description: "获取您想要学习的视频文件。推荐使用合法工具：",
        details: [
          "使用 yt-dlp 命令行工具下载 YouTube 视频",
          "从其他合法视频平台下载",
          "使用您自己的视频文件",
          "确保遵守版权和使用条款",
        ],
        image: "/help/1.get_video.png",
        tips: "💡 提示：选择有清晰语音的视频效果最佳",
      },
      {
        title: "2. 上传视频文件",
        description: "在首页选择语言并上传您的视频：",
        details: [
          "打开 FluentReact 首页",
          "选择视频的语言（英语、日语等）",
          "点击上传区域选择视频文件",
          "等待视频处理完成",
        ],
        image: "/help/2.choose_language and upload file.png",
        tips: "💡 支持 MP4、AVI、MOV 等常见格式",
      },
      {
        title: "3. 获取字幕",
        description: "通过 AI 自动生成字幕或上传现有字幕：",
        details: [
          "AI 自动转录：将视频转换为音频，上传到 AI 服务",
          "需要 AssemblyAI API 密钥（免费额度）",
          "耐心等待转录完成（取决于视频长度）",
          "或直接上传 SRT、VTT 等字幕文件",
        ],
        image: "/help/3.get subtitles by ai.png",
        tips: "💡 如果没有 API 密钥，系统会引导您设置",
      },
      {
        title: "4. 设置 API 密钥",
        description: "在设置页面添加您的 AssemblyAI API 密钥：",
        details: [
          "点击导航栏的齿轮图标进入设置",
          "按照指引获取免费的 AssemblyAI API 密钥",
          "注册账户获得 $50 免费额度（约50小时转录）",
          "复制 API 密钥并粘贴到设置页面",
        ],
        image: "/help/4.input api key.png",
        tips: "💡 API 密钥仅存储在本地，保护您的隐私",
      },
      {
        title: "5. 开始学习",
        description: "使用交互式功能进行语言学习：",
        details: [
          "点击视频自动播放到对应位置",
          "手动选择字幕进行跟读练习",
          "不熟悉的单词点击加入生词本",
          "重要：点击底部的 'Add to My List' 保存项目",
        ],
        image: "/help/5.easy demo.png",
        tips: "💡 添加到学习列表后可以随时继续学习",
      },
      {
        title: "6. 管理学习项目",
        description: "使用学习项目列表管理您的学习进度：",
        details: [
          "点击导航栏的 'My List' 查看所有项目",
          "点击任意项目直接进入学习界面",
          "查看学习进度和最后访问时间",
          "其他功能可通过导航栏对应链接访问",
        ],
        image: "/help/6.learning projcts.png",
        tips: "💡 所有数据存储在本地，确保隐私安全",
      },
    ],
  },
  ja: {
    title: "学習を始めるには？",
    subtitle: "完全な動画言語学習ガイド",
    steps: [
      {
        title: "1. 学習動画を取得",
        description:
          "学習したい動画ファイルを取得します。合法なツールをお勧めします：",
        details: [
          "yt-dlp コマンドラインツールで YouTube 動画をダウンロード",
          "他の合法な動画プラットフォームからダウンロード",
          "自分の動画ファイルを使用",
          "著作権と利用規約を遵守することを確認",
        ],
        image: "/help/1.get_video.png",
        tips: "💡 ヒント：クリアな音声の動画を選ぶと効果的です",
      },
      {
        title: "2. 動画ファイルをアップロード",
        description: "ホームページで言語を選択し、動画をアップロード：",
        details: [
          "FluentReact ホームページを開く",
          "動画の言語を選択（英語、日本語など）",
          "アップロードエリアをクリックして動画ファイルを選択",
          "動画処理の完了を待つ",
        ],
        image: "/help/2.choose_language and upload file.png",
        tips: "💡 MP4、AVI、MOV などの一般的な形式をサポート",
      },
      {
        title: "3. 字幕を取得",
        description: "AI で自動生成するか、既存の字幕をアップロード：",
        details: [
          "AI 自動転写：動画を音声に変換し、AI サービスにアップロード",
          "AssemblyAI API キーが必要（無料枠あり）",
          "転写完了までお待ちください（動画の長さによります）",
          "または SRT、VTT などの字幕ファイルを直接アップロード",
        ],
        image: "/help/3.get subtitles by ai.png",
        tips: "💡 API キーがない場合、システムが設定を案内します",
      },
      {
        title: "4. API キーを設定",
        description: "設定ページで AssemblyAI API キーを追加：",
        details: [
          "ナビゲーションバーの歯車アイコンをクリックして設定に入る",
          "無料の AssemblyAI API キーを取得する手順に従う",
          "アカウント登録で $50 の無料枠を獲得（約50時間の転写）",
          "API キーをコピーして設定ページに貼り付け",
        ],
        image: "/help/4.input api key.png",
        tips: "💡 API キーはローカルにのみ保存され、プライバシーを保護",
      },
      {
        title: "5. 学習を開始",
        description: "インタラクティブ機能を使用して言語学習：",
        details: [
          "動画をクリックして対応する位置に自動再生",
          "字幕を手動で選択してシャドーイング練習",
          "知らない単語をクリックして単語帳に追加",
          "重要：下部の 'Add to My List' をクリックしてプロジェクトを保存",
        ],
        image: "/help/5.easy demo.png",
        tips: "💡 学習リストに追加すると、いつでも学習を続けることができます",
      },
      {
        title: "6. 学習プロジェクトを管理",
        description: "学習プロジェクトリストで学習進捗を管理：",
        details: [
          "ナビゲーションバーの 'My List' をクリックしてすべてのプロジェクトを表示",
          "任意のプロジェクトをクリックして学習画面に直接入る",
          "学習進捗と最終アクセス時間を確認",
          "その他の機能はナビゲーションバーの対応するリンクからアクセス",
        ],
        image: "/help/6.learning projcts.png",
        tips: "💡 すべてのデータはローカルに保存され、プライバシーの安全性を確保",
      },
    ],
  },
  ko: {
    title: "학습을 시작하는 방법은?",
    subtitle: "완전한 비디오 언어 학습 가이드",
    steps: [
      {
        title: "1. 학습 비디오 획득",
        description:
          "학습하고 싶은 비디오 파일을 획득합니다. 합법적인 도구를 권장합니다：",
        details: [
          "yt-dlp 명령줄 도구로 YouTube 비디오 다운로드",
          "다른 합법적인 비디오 플랫폼에서 다운로드",
          "자신의 비디오 파일 사용",
          "저작권 및 이용약관 준수 확인",
        ],
        image: "/help/1.get_video.png",
        tips: "💡 팁：명확한 음성이 있는 비디오를 선택하면 효과적입니다",
      },
      {
        title: "2. 비디오 파일 업로드",
        description: "홈페이지에서 언어를 선택하고 비디오를 업로드：",
        details: [
          "FluentReact 홈페이지 열기",
          "비디오의 언어 선택（영어、일본어 등）",
          "업로드 영역을 클릭하여 비디오 파일 선택",
          "비디오 처리 완료 대기",
        ],
        image: "/help/2.choose_language and upload file.png",
        tips: "💡 MP4、AVI、MOV 등의 일반적인 형식을 지원",
      },
      {
        title: "3. 자막 획득",
        description: "AI로 자동 생성하거나 기존 자막을 업로드：",
        details: [
          "AI 자동 전사：비디오를 오디오로 변환하여 AI 서비스에 업로드",
          "AssemblyAI API 키 필요（무료 할당량 있음）",
          "전사 완료까지 기다려주세요（비디오 길이에 따라 다름）",
          "또는 SRT、VTT 등의 자막 파일을 직접 업로드",
        ],
        image: "/help/3.get subtitles by ai.png",
        tips: "💡 API 키가 없는 경우 시스템이 설정을 안내합니다",
      },
      {
        title: "4. API 키 설정",
        description: "설정 페이지에서 AssemblyAI API 키 추가：",
        details: [
          "네비게이션 바의 톱니바퀴 아이콘을 클릭하여 설정으로 들어가기",
          "무료 AssemblyAI API 키를 획득하는 단계에 따라 진행",
          "계정 등록으로 $50 무료 할당량 획득（약50시간 전사）",
          "API 키를 복사하여 설정 페이지에 붙여넣기",
        ],
        image: "/help/4.input api key.png",
        tips: "💡 API 키는 로컬에만 저장되어 개인정보를 보호합니다",
      },
      {
        title: "5. 학습 시작",
        description: "인터랙티브 기능을 사용하여 언어 학습：",
        details: [
          "비디오를 클릭하여 해당 위치로 자동 재생",
          "자막을 수동으로 선택하여 섀도잉 연습",
          "모르는 단어를 클릭하여 단어장에 추가",
          "중요：하단의 'Add to My List'를 클릭하여 프로젝트 저장",
        ],
        image: "/help/5.easy demo.png",
        tips: "💡 학습 목록에 추가하면 언제든지 학습을 계속할 수 있습니다",
      },
      {
        title: "6. 학습 프로젝트 관리",
        description: "학습 프로젝트 목록으로 학습 진행 상황 관리：",
        details: [
          "네비게이션 바의 'My List'를 클릭하여 모든 프로젝트 표시",
          "임의의 프로젝트를 클릭하여 학습 화면으로 직접 들어가기",
          "학습 진행 상황과 최종 접근 시간 확인",
          "기타 기능은 네비게이션 바의 해당 링크에서 접근",
        ],
        image: "/help/6.learning projcts.png",
        tips: "💡 모든 데이터는 로컬에 저장되어 개인정보의 안전성을 보장합니다",
      },
    ],
  },
  en: {
    title: "How to Start Learning?",
    subtitle: "Complete Video Language Learning Guide",
    steps: [
      {
        title: "1. Get Learning Video",
        description:
          "Obtain the video file you want to learn from. We recommend using legal tools:",
        details: [
          "Use yt-dlp command line tool to download YouTube videos",
          "Download from other legal video platforms",
          "Use your own video files",
          "Ensure compliance with copyright and terms of use",
        ],
        image: "/help/1.get_video.png",
        tips: "💡 Tip: Choose videos with clear audio for best results",
      },
      {
        title: "2. Upload Video File",
        description: "Select language and upload your video on the homepage:",
        details: [
          "Open FluentReact homepage",
          "Select the video's language (English, Japanese, etc.)",
          "Click the upload area to select video file",
          "Wait for video processing to complete",
        ],
        image: "/help/2.choose_language and upload file.png",
        tips: "💡 Supports common formats like MP4, AVI, MOV",
      },
      {
        title: "3. Get Subtitles",
        description:
          "Generate subtitles automatically via AI or upload existing ones:",
        details: [
          "AI auto-transcription: Convert video to audio, upload to AI service",
          "Requires AssemblyAI API key (free credits available)",
          "Wait patiently for transcription to complete (depends on video length)",
          "Or directly upload subtitle files like SRT, VTT",
        ],
        image: "/help/3.get subtitles by ai.png",
        tips: "💡 If you don't have an API key, the system will guide you to set it up",
      },
      {
        title: "4. Set Up API Key",
        description: "Add your AssemblyAI API key in the settings page:",
        details: [
          "Click the gear icon in navigation bar to enter settings",
          "Follow the guide to get free AssemblyAI API key",
          "Register account to get $50 free credits (about 50 hours of transcription)",
          "Copy API key and paste it in the settings page",
        ],
        image: "/help/4.input api key.png",
        tips: "💡 API key is only stored locally, protecting your privacy",
      },
      {
        title: "5. Start Learning",
        description: "Use interactive features for language learning:",
        details: [
          "Click video to auto-play to corresponding position",
          "Manually select subtitles for shadowing practice",
          "Click unfamiliar words to add to vocabulary list",
          "Important: Click 'Add to My List' at the bottom to save project",
        ],
        image: "/help/5.easy demo.png",
        tips: "💡 After adding to learning list, you can continue learning anytime",
      },
      {
        title: "6. Manage Learning Projects",
        description:
          "Use learning project list to manage your learning progress:",
        details: [
          "Click 'My List' in navigation bar to view all projects",
          "Click any project to directly enter learning interface",
          "View learning progress and last access time",
          "Other features accessible via corresponding links in navigation bar",
        ],
        image: "/help/6.learning projcts.png",
        tips: "💡 All data stored locally, ensuring privacy and security",
      },
    ],
  },
};

export default function HelpPage() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("zh");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {helpContent[currentLanguage].title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {helpContent[currentLanguage].subtitle}
          </p>

          {/* Language Selector */}
          <div className="flex justify-center space-x-2 mt-6">
            {Object.keys(helpContent).map((lang) => (
              <Button
                key={lang}
                variant={currentLanguage === lang ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentLanguage(lang as Language)}
                className="min-w-[60px]"
              >
                {lang === "zh"
                  ? "中文"
                  : lang === "ja"
                  ? "日本語"
                  : lang === "ko"
                  ? "한국어"
                  : "English"}
              </Button>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {helpContent[currentLanguage].steps.map((step, index) => (
            <Card
              key={index}
              className="overflow-hidden border-2 border-blue-100"
            >
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-blue-900">
                      {step.title}
                    </CardTitle>
                    <p className="text-blue-700 mt-2">{step.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Image */}
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-blue-800 text-sm font-medium">
                        {step.tips}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {currentLanguage === "zh"
                        ? "详细步骤："
                        : currentLanguage === "ja"
                        ? "詳細な手順："
                        : currentLanguage === "ko"
                        ? "상세 단계："
                        : "Detailed Steps:"}
                    </h4>
                    <ul className="space-y-3">
                      {step.details.map((detail, detailIndex) => (
                        <li
                          key={detailIndex}
                          className="flex items-start space-x-3"
                        >
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 leading-relaxed">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Start CTA */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-green-800 mb-4">
                {currentLanguage === "zh"
                  ? "准备开始了吗？"
                  : currentLanguage === "ja"
                  ? "準備はできましたか？"
                  : currentLanguage === "ko"
                  ? "준비되었나요？"
                  : "Ready to Start?"}
              </h3>
              <p className="text-green-700 mb-6">
                {currentLanguage === "zh"
                  ? "现在就开始您的语言学习之旅吧！"
                  : currentLanguage === "ja"
                  ? "今すぐ言語学習の旅を始めましょう！"
                  : currentLanguage === "ko"
                  ? "지금 바로 언어 학습 여행을 시작하세요！"
                  : "Start your language learning journey now!"}
              </p>
              <Link href="/">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Play className="w-5 h-5 mr-2" />
                  {currentLanguage === "zh"
                    ? "开始学习"
                    : currentLanguage === "ja"
                    ? "学習を開始"
                    : currentLanguage === "ko"
                    ? "학습 시작"
                    : "Start Learning"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
