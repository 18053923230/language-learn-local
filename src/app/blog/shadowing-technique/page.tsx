import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "A Step-by-Step Guide to Shadowing with Videos - FluentReact Blog",
  description:
    "Master the shadowing technique using video content. Learn how to improve pronunciation, rhythm, and fluency by following along with native speakers in your favorite videos.",
  keywords:
    "shadowing technique, video language learning, pronunciation practice, fluency improvement, native speaker imitation",
  openGraph: {
    title: "A Step-by-Step Guide to Shadowing with Videos",
    description:
      "Master pronunciation and fluency with the shadowing technique using video content.",
  },
};

const shadowingBenefits = [
  {
    title: "Improved Pronunciation",
    description:
      "Mimic native speaker sounds, intonation, and rhythm to sound more natural.",
    icon: "🎯",
  },
  {
    title: "Better Fluency",
    description:
      "Develop natural speech patterns and reduce hesitation in conversation.",
    icon: "⚡",
  },
  {
    title: "Enhanced Listening",
    description:
      "Train your ear to recognize subtle pronunciation differences.",
    icon: "👂",
  },
  {
    title: "Confidence Building",
    description:
      "Practice speaking without pressure in a safe, controlled environment.",
    icon: "💪",
  },
];

const shadowingSteps = [
  {
    step: "1",
    title: "Choose the Right Content",
    description:
      "Select videos with clear speech, moderate pace, and content you're interested in.",
    tips: [
      "Start with slower speakers",
      "Choose familiar topics",
      "Avoid heavy accents initially",
    ],
  },
  {
    step: "2",
    title: "Listen First",
    description:
      "Watch the video without speaking to understand the content and rhythm.",
    tips: [
      "Pay attention to intonation",
      "Notice natural pauses",
      "Identify key phrases",
    ],
  },
  {
    step: "3",
    title: "Start Shadowing",
    description:
      "Speak along with the audio, trying to match timing and pronunciation exactly.",
    tips: [
      "Start with short segments",
      "Focus on rhythm over speed",
      "Don't worry about mistakes",
    ],
  },
  {
    step: "4",
    title: "Practice and Repeat",
    description:
      "Repeat the same segment multiple times until you feel comfortable.",
    tips: ["Use loop function", "Record yourself", "Compare with original"],
  },
];

const commonMistakes = [
  {
    mistake: "Trying to speak too fast",
    solution:
      "Focus on accuracy first, speed will come naturally with practice.",
  },
  {
    mistake: "Ignoring intonation",
    solution: "Pay attention to the rise and fall of the speaker's voice.",
  },
  {
    mistake: "Skipping difficult words",
    solution:
      "Practice challenging words separately before shadowing the full sentence.",
  },
  {
    mistake: "Not using video content",
    solution: "Visual cues help with context and make shadowing more engaging.",
  },
];

export default function ShadowingTechniquePage() {
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
              January 10, 2024
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              12 min read
            </div>
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Technique
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            A Step-by-Step Guide to Shadowing with Videos
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Shadowing is one of the most effective techniques for improving
            pronunciation and fluency. Learn how to use video content to master
            this powerful language learning method with FluentReact.
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              "shadowing",
              "pronunciation",
              "fluency",
              "video learning",
              "speaking practice",
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
              What is Shadowing?
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Shadowing is a language learning technique where you listen to
              native speech and repeat it simultaneously, trying to match the
              pronunciation, rhythm, and intonation as closely as possible. It's
              like being an echo of the original speaker, but with the goal of
              internalizing natural speech patterns.
            </p>
            <p className="text-gray-600 leading-relaxed">
              While traditional shadowing often uses audio-only content, video
              adds a crucial visual dimension. You can see the speaker's mouth
              movements, facial expressions, and body language, making it easier
              to understand and imitate the pronunciation.
            </p>
          </div>

          {/* Benefits Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why Shadowing with Videos is So Effective
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shadowingBenefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{benefit.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              How to Shadow with FluentReact: Step-by-Step Guide
            </h2>
            <div className="space-y-8">
              {shadowingSteps.map((step, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-lg">
                          {step.step}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {step.description}
                        </p>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-2">
                            Pro Tips:
                          </h4>
                          <ul className="list-disc list-inside text-blue-700 space-y-1">
                            {step.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="text-sm">
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FluentReact Features for Shadowing */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              FluentReact Features That Make Shadowing Easy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Click to Play
                </h3>
                <p className="text-gray-600 text-sm">
                  Click any subtitle to jump to that exact moment and start
                  shadowing.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Loop Segments
                </h3>
                <p className="text-gray-600 text-sm">
                  Repeat difficult sentences until you master the pronunciation.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Pause className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Control Speed
                </h3>
                <p className="text-gray-600 text-sm">
                  Adjust playback speed to match your current skill level.
                </p>
              </div>
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Common Shadowing Mistakes to Avoid
            </h2>
            <div className="space-y-4">
              {commonMistakes.map((item, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 text-sm font-bold">
                          ✗
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {item.mistake}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {item.solution}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Practice Routine */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Recommended Shadowing Practice Routine
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Daily Practice (15-20 minutes)
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start space-x-3">
                    <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 text-xs font-bold">
                        1
                      </span>
                    </span>
                    <span>Choose a 2-3 minute video segment</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 text-xs font-bold">
                        2
                      </span>
                    </span>
                    <span>Listen to the entire segment first</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 text-xs font-bold">
                        3
                      </span>
                    </span>
                    <span>Shadow along with the video 3-5 times</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 text-xs font-bold">
                        4
                      </span>
                    </span>
                    <span>Focus on one difficult sentence</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Weekly Goals
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start space-x-3">
                    <span className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-pink-600 text-xs font-bold">1</span>
                    </span>
                    <span>Master 5 new pronunciation patterns</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-pink-600 text-xs font-bold">2</span>
                    </span>
                    <span>Practice with 3 different speakers</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-pink-600 text-xs font-bold">3</span>
                    </span>
                    <span>Record yourself and compare</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-pink-600 text-xs font-bold">4</span>
                    </span>
                    <span>Try shadowing at different speeds</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Conclusion */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Start Shadowing Today
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Shadowing with video content is one of the most effective ways to
              improve your pronunciation and fluency. With FluentReact's
              interactive features, you can practice with any video content you
              choose, making your language learning journey more personalized
              and effective.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Remember, consistency is key. Even 15 minutes of daily shadowing
              practice can make a significant difference in your speaking
              abilities. Start with simple content and gradually challenge
              yourself with more complex material.
            </p>
          </div>
        </article>

        {/* CTA Section */}
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Master Shadowing?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Try FluentReact today and experience the power of interactive video
            shadowing. Upload your favorite videos and start practicing with
            native speakers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Start Shadowing with FluentReact
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" size="lg">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
