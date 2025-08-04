"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "Is FluentReact free?",
    answer:
      "Yes, FluentReact is currently free to use. We're focused on building the best tool for language learners and making it accessible to everyone.",
    category: "Pricing",
  },
  {
    question: "What video formats are supported?",
    answer:
      "We support most common video formats including MP4, AVI, MOV, MKV, WebM, and more. If your browser can play it, FluentReact can process it.",
    category: "Technical",
  },
  {
    question: "How accurate are the subtitles?",
    answer:
      "We use advanced AI transcription technology that provides highly accurate subtitles, especially for clear speech. The accuracy depends on audio quality and speech clarity.",
    category: "Technical",
  },
  {
    question: "How is FluentReact different from Language Reactor?",
    answer:
      "Language Reactor works with Netflix and YouTube through a browser extension. FluentReact works with any video file you have, processes everything locally on your device for complete privacy, and doesn't require any browser extensions.",
    category: "Comparison",
  },
  {
    question: "Can I use FluentReact offline?",
    answer:
      "Yes! All processing happens locally on your device, so you can learn without an internet connection. You only need internet for the initial page load.",
    category: "Privacy",
  },
  {
    question: "Do you upload my videos to your servers?",
    answer:
      "No, absolutely not. All video processing happens locally in your browser. Your videos never leave your device, ensuring complete privacy.",
    category: "Privacy",
  },
  {
    question: "What languages are supported?",
    answer:
      "Currently, we support English transcription and learning. We're working on adding support for more languages in the future.",
    category: "Technical",
  },
  {
    question: "Can I save my vocabulary and progress?",
    answer:
      "Yes! All your vocabulary, subtitles, and learning progress are saved locally in your browser. Your data stays with you.",
    category: "Features",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "There's no strict file size limit, but larger files will take longer to process. We recommend videos under 2GB for optimal performance.",
    category: "Technical",
  },
  {
    question: "Can I use FluentReact on mobile?",
    answer:
      "FluentReact works best on desktop and laptop computers due to the processing requirements. Mobile support is planned for future updates.",
    category: "Technical",
  },
  {
    question: "How do I get the best results?",
    answer:
      "For best results, use videos with clear audio, minimal background noise, and good speech quality. HD videos with stereo audio work best.",
    category: "Tips",
  },
  {
    question: "Can I export my vocabulary or subtitles?",
    answer:
      "Yes! You can export your vocabulary lists and subtitle files for use in other applications or for backup purposes.",
    category: "Features",
  },
];

const categories = [
  "All",
  "Technical",
  "Privacy",
  "Features",
  "Pricing",
  "Comparison",
  "Tips",
];

export function FAQClient() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const filteredFaqs =
    selectedCategory === "All"
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about FluentReact&apos;s interactive
            video language learning platform.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
            >
              <CardHeader
                className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => toggleItem(index)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </CardTitle>
                  {openItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                    {faq.category}
                  </span>
                </div>
              </CardHeader>
              {openItems.includes(index) && (
                <CardContent className="pt-0">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </CardDescription>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Can&apos;t find what you&apos;re looking for? Try our tool and see
            how it works for yourself.
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
