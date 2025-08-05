"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Languages,
  Clock,
  Play,
  BookOpen,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const tutorialSteps = [
  {
    icon: Languages,
    title: "Select Video Language",
    description:
      "Choose the language of your video content for accurate transcription and translation.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Upload,
    title: "Upload Your Video",
    description:
      "Upload any video file (MP4, AVI, MOV, etc.) from your device. No size limits, works offline.",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: Clock,
    title: "Wait for Processing",
    description:
      "Our AI processes your video locally to generate accurate subtitles and transcriptions.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: Play,
    title: "Click & Learn",
    description:
      "Click any subtitle to play that segment, loop sentences, and practice pronunciation.",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    icon: BookOpen,
    title: "Build Vocabulary",
    description:
      "Add unfamiliar words to your personal vocabulary list for focused study and review.",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    icon: CheckCircle,
    title: "Track Progress",
    description:
      "Monitor your learning progress with detailed statistics and vocabulary mastery tracking.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
];

export function TutorialSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            Simple 6-Step Process
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How FluentReact Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform any video into an interactive language learning experience
            in just 6 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tutorialSteps.map((step, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${step.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Step {index + 1}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-blue-600 font-semibold">
            <span>Ready to start learning?</span>
            <ArrowRight className="w-4 h-4" />
          </div>
          <p className="text-gray-600 mt-2">
            Upload your first video and experience the future of language
            learning
          </p>
        </div>
      </div>
    </section>
  );
}
