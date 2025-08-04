import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Shield, Zap, BookOpen } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How FluentReact Works - Interactive Video Language Learning",
  description:
    "Learn how FluentReact transforms any video into an interactive language learning experience. Upload, generate subtitles, and start learning - all locally on your device.",
  keywords:
    "how to use FluentReact, video language learning tutorial, interactive subtitles, local processing",
  openGraph: {
    title: "How FluentReact Works - Step by Step Guide",
    description:
      "Transform any video into an interactive language learning experience in 3 simple steps.",
  },
};

const steps = [
  {
    number: "1",
    title: "Upload Your Video",
    description:
      "Drag and drop any video file you want to learn from. We support MP4, AVI, MOV, MKV, and more.",
    icon: "📁",
    features: ["Any video format", "No file size limits", "Instant upload"],
  },
  {
    number: "2",
    title: "Auto-Generate Subtitles",
    description:
      "Our advanced AI creates accurate subtitles in seconds. All processing happens locally on your device.",
    icon: "🎯",
    features: ["AI-powered transcription", "Local processing", "High accuracy"],
  },
  {
    number: "3",
    title: "Start Learning",
    description:
      "Click subtitles to play, loop sentences, and save words to your vocabulary. Learn at your own pace.",
    icon: "🎓",
    features: [
      "Interactive subtitles",
      "Sentence looping",
      "Vocabulary building",
    ],
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Complete Privacy",
    description:
      "All video processing happens locally on your device. Your videos never leave your computer.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "No waiting for uploads or downloads. Process videos instantly with local AI.",
  },
  {
    icon: BookOpen,
    title: "Learn Anywhere",
    description:
      "Works offline. Learn with your own video collection, online courses, or movie files.",
  },
];

export default function HowItWorksPage() {
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
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
            How FluentReact Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform any video into an interactive language learning experience
            in just 3 simple steps.
            <strong className="text-blue-600">
              {" "}
              All processing happens locally on your device for complete
              privacy.
            </strong>
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <Card
              key={step.number}
              className="relative overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm"
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">{step.icon}</span>
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">
                    {step.number}
                  </span>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {step.title}
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {step.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {step.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="w-8 h-8 text-blue-400" />
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose FluentReact?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
              >
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {benefit.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600 leading-relaxed">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of language learners who are already using
            FluentReact to master new languages with their favorite videos.
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
