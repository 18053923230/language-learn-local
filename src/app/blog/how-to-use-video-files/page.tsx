import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "How to Use Your Own Video Files for Language Learning (When Language Reactor Can't) - FluentReact Blog",
  description:
    "Discover how to transform your personal video collection into powerful language learning tools. Learn why local video files offer unique advantages over streaming platforms.",
  keywords:
    "video language learning, local video files, Language Reactor alternative, personal video collection, offline language learning",
  openGraph: {
    title: "How to Use Your Own Video Files for Language Learning",
    description:
      "Transform your video collection into powerful language learning tools with local processing and complete privacy.",
  },
};

const advantages = [
  {
    title: "Complete Control Over Content",
    description:
      "Choose exactly what you want to learn from, not limited to what's available on streaming platforms.",
    icon: CheckCircle,
  },
  {
    title: "Privacy & Security",
    description:
      "Your videos never leave your device. All processing happens locally for complete privacy.",
    icon: CheckCircle,
  },
  {
    title: "Offline Learning",
    description:
      "Learn anywhere, anytime, even without an internet connection.",
    icon: CheckCircle,
  },
  {
    title: "No Platform Restrictions",
    description: "Work with any video format: MP4, AVI, MOV, MKV, and more.",
    icon: CheckCircle,
  },
  {
    title: "Personal Learning Path",
    description:
      "Create your own curriculum from your favorite movies, courses, or personal recordings.",
    icon: CheckCircle,
  },
  {
    title: "No Subscription Fees",
    description:
      "Use your own content without paying for multiple streaming subscriptions.",
    icon: CheckCircle,
  },
];

const limitations = [
  {
    title: "Limited to Netflix & YouTube",
    description:
      "Can only work with content available on these specific platforms.",
    icon: XCircle,
  },
  {
    title: "Requires Internet Connection",
    description: "Cannot work offline or with downloaded content.",
    icon: XCircle,
  },
  {
    title: "Browser Extension Dependency",
    description:
      "Tied to specific browsers and requires extension installation.",
    icon: XCircle,
  },
  {
    title: "No Personal Content Support",
    description: "Cannot process your own video files or downloaded content.",
    icon: XCircle,
  },
];

const useCases = [
  {
    title: "Your Movie Collection",
    description:
      "Transform your downloaded movies and TV shows into interactive language lessons.",
    examples: [
      "Netflix downloads",
      "Personal movie collection",
      "Educational films",
    ],
  },
  {
    title: "Online Course Videos",
    description:
      "Download course videos and create your own interactive learning experience.",
    examples: [
      "Coursera videos",
      "Udemy courses",
      "YouTube educational content",
    ],
  },
  {
    title: "Personal Recordings",
    description:
      "Practice with your own recorded conversations, presentations, or family videos.",
    examples: [
      "Video calls",
      "Presentations",
      "Family videos",
      "Travel recordings",
    ],
  },
  {
    title: "Podcast Videos",
    description: "Convert video podcasts into language learning material.",
    examples: ["TED Talks", "Educational podcasts", "Interview videos"],
  },
];

export default function HowToUseVideoFilesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FR</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                FluentReact
              </h1>
            </div>
            <Link href="/blog">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              January 15, 2024
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />8 min read
            </div>
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Tutorial
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            How to Use Your Own Video Files for Language Learning (When Language
            Reactor Can&apos;t)
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Language Reactor is a fantastic tool for Netflix and YouTube, but
            what about your personal video collection? Discover how to transform
            any video file into an interactive language learning experience with
            complete privacy and control.
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              "video learning",
              "local files",
              "Language Reactor alternative",
              "privacy",
              "offline learning",
            ].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              The Language Reactor Limitation
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Language Reactor has revolutionized language learning for Netflix
              and YouTube users. However, it has a significant limitation: it
              only works with streaming content from these specific platforms.
              This means you're missing out on a world of learning opportunities
              with your own video content.
            </p>
            <p className="text-gray-600 leading-relaxed">
              What about your downloaded movies, online course videos, personal
              recordings, or any other video content you've collected? These
              could be your most valuable learning resources, but they're
              inaccessible to traditional browser-based language learning tools.
            </p>
          </div>

          {/* Advantages Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why Local Video Files Are Superior for Language Learning
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {advantages.map((advantage, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <advantage.icon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {advantage.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {advantage.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Limitations Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              What Language Reactor Can't Do
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {limitations.map((limitation, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <limitation.icon className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {limitation.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {limitation.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Use Cases Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Perfect Use Cases for Local Video Files
            </h2>
            <div className="space-y-6">
              {useCases.map((useCase, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {useCase.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {useCase.examples.map((example) => (
                        <span
                          key={example}
                          className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How FluentReact Solves This */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              How FluentReact Solves This Problem
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📁</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Upload Any Video
                </h3>
                <p className="text-gray-600 text-sm">
                  Support for all major video formats including MP4, AVI, MOV,
                  MKV, and more.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Local Processing
                </h3>
                <p className="text-gray-600 text-sm">
                  All processing happens on your device. Your videos never leave
                  your computer.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Interactive Learning
                </h3>
                <p className="text-gray-600 text-sm">
                  Click subtitles to play, loop sentences, and build vocabulary
                  naturally.
                </p>
              </div>
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Getting Started with Your Video Files
            </h2>
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Step 1: Prepare Your Video Files
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Gather your video content. This could be downloaded movies,
                  course videos, personal recordings, or any other video files
                  you want to learn from.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>
                    Ensure your video files are in a supported format (MP4, AVI,
                    MOV, MKV, etc.)
                  </li>
                  <li>
                    For best results, use videos with clear audio and good
                    speech quality
                  </li>
                  <li>Consider organizing your videos by language or topic</li>
                </ul>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Step 2: Upload and Process
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Use FluentReact to upload your video files. The platform will
                  automatically generate accurate subtitles using advanced AI
                  technology.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Drag and drop your video files into FluentReact</li>
                  <li>Select the target language for transcription</li>
                  <li>
                    Wait for the AI to generate subtitles (usually takes a few
                    minutes)
                  </li>
                </ul>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Step 3: Start Learning
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Once subtitles are generated, you can start interactive
                  learning with your video content.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>
                    Click on any subtitle to jump to that moment in the video
                  </li>
                  <li>Use the loop function to repeat difficult sentences</li>
                  <li>Save new words to your vocabulary for later review</li>
                  <li>Practice shadowing by following along with the audio</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Conclusion */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Unlock Your Video Collection's Learning Potential
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Your personal video collection is a goldmine of language learning
              opportunities. With FluentReact, you can transform any video file
              into an interactive learning experience while maintaining complete
              privacy and control over your content.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Don't let platform limitations restrict your learning. Start using
              your own video files today and discover a more personalized,
              private, and effective way to learn languages.
            </p>
          </div>
        </article>

        {/* CTA Section */}
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Video Collection?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Try FluentReact today and experience the power of interactive video
            language learning with your own content. All processing happens
            locally on your device for complete privacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Try FluentReact Free
              </Button>
            </Link>
            <Link href="/language-reactor-alternative">
              <Button variant="outline" size="lg">
                Compare with Language Reactor
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
