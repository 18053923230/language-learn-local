import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  BookOpen,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Why Sentence Mining is More Effective Than Flashcards - FluentReact Blog",
  description:
    "Discover why sentence mining from video content is superior to traditional flashcard methods. Learn how context and real-world usage make vocabulary stick better.",
  keywords:
    "sentence mining, vocabulary learning, context learning, language learning methods, video vocabulary",
  openGraph: {
    title: "Why Sentence Mining is More Effective Than Flashcards",
    description:
      "Learn why sentence mining from video content beats traditional flashcard methods.",
  },
};

const sentenceMiningBenefits = [
  {
    title: "Context-Rich Learning",
    description:
      "Learn words in their natural context, making them easier to remember and use correctly.",
    icon: "🎯",
  },
  {
    title: "Real-World Usage",
    description:
      "See how words are actually used by native speakers in authentic situations.",
    icon: "🌍",
  },
  {
    title: "Better Retention",
    description:
      "Context and emotion help create stronger memory connections than isolated words.",
    icon: "🧠",
  },
  {
    title: "Natural Grammar",
    description:
      "Learn grammar patterns naturally through exposure to real sentences.",
    icon: "📝",
  },
];

const flashcardProblems = [
  {
    problem: "Decontextualized Learning",
    description:
      "Words learned in isolation lack the context needed for proper usage.",
    impact: "Difficulty using words correctly in real conversations",
  },
  {
    problem: "Artificial Examples",
    description:
      "Flashcard sentences are often simplified and don't reflect natural speech.",
    impact: "Learned language sounds unnatural or robotic",
  },
  {
    problem: "Limited Exposure",
    description:
      "Only see one example of word usage, missing variations and nuances.",
    impact: "Inflexible understanding of word meanings",
  },
  {
    problem: "No Emotional Connection",
    description:
      "Lack of context makes it harder to form memorable associations.",
    impact: "Poor long-term retention and recall",
  },
];

const sentenceMiningSteps = [
  {
    step: "1",
    title: "Identify Interesting Sentences",
    description:
      "Look for sentences that contain new vocabulary or interesting grammar patterns.",
    criteria: [
      "Contains new words",
      "Shows natural usage",
      "Interesting or memorable",
    ],
  },
  {
    step: "2",
    title: "Extract and Save",
    description:
      "Save the sentence with its context and translation for later review.",
    criteria: ["Full sentence", "Context information", "Personal translation"],
  },
  {
    step: "3",
    title: "Review Regularly",
    description:
      "Review your collected sentences to reinforce learning and retention.",
    criteria: ["Daily review", "Active recall", "Usage practice"],
  },
  {
    step: "4",
    title: "Apply in Practice",
    description:
      "Use the learned patterns and vocabulary in your own speaking and writing.",
    criteria: ["Speaking practice", "Writing exercises", "Real conversations"],
  },
];

const videoAdvantages = [
  {
    advantage: "Visual Context",
    description:
      "See facial expressions, gestures, and body language that provide additional meaning.",
  },
  {
    advantage: "Audio Cues",
    description: "Hear pronunciation, intonation, and natural speech patterns.",
  },
  {
    advantage: "Emotional Connection",
    description:
      "Connect words to emotions and situations, making them more memorable.",
  },
  {
    advantage: "Authentic Content",
    description:
      "Learn from real conversations, not artificial textbook examples.",
  },
];

export default function SentenceMiningPage() {
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
              January 5, 2024
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              10 min read
            </div>
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Methodology
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            Why Sentence Mining is More Effective Than Flashcards
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Traditional flashcard methods have dominated language learning for
            decades, but there's a more effective approach: sentence mining.
            Discover how learning vocabulary in context from video content can
            transform your language acquisition.
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              "sentence mining",
              "vocabulary",
              "context learning",
              "video learning",
              "language methods",
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
              The Problem with Traditional Flashcards
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              For years, language learners have relied on flashcards to memorize
              vocabulary. While this method can help you recognize words, it has
              significant limitations that prevent truly effective language
              acquisition.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Flashcards teach words in isolation, divorced from their natural
              context. This approach might help you pass vocabulary tests, but
              it doesn't prepare you for real-world language use where context,
              nuance, and natural expression matter most.
            </p>
          </div>

          {/* Flashcard Problems */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why Flashcards Fall Short
            </h2>
            <div className="space-y-6">
              {flashcardProblems.map((item, index) => (
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
                          {item.problem}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-2">
                          {item.description}
                        </p>
                        <p className="text-red-600 text-sm font-medium">
                          Impact: {item.impact}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sentence Mining Benefits */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              The Power of Sentence Mining
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Sentence mining is the practice of collecting and studying
              complete sentences from authentic content. Instead of learning
              isolated words, you learn vocabulary within its natural context,
              making it much more likely to stick and be used correctly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sentenceMiningBenefits.map((benefit, index) => (
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

          {/* Video Content Advantages */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Why Video Content is Perfect for Sentence Mining
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videoAdvantages.map((advantage, index) => (
                <div key={index} className="bg-white/60 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {advantage.advantage}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {advantage.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              How to Practice Sentence Mining with FluentReact
            </h2>
            <div className="space-y-8">
              {sentenceMiningSteps.map((step, index) => (
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
                            Selection Criteria:
                          </h4>
                          <ul className="list-disc list-inside text-blue-700 space-y-1">
                            {step.criteria.map((criterion, criterionIndex) => (
                              <li key={criterionIndex} className="text-sm">
                                {criterion}
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

          {/* FluentReact Features */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              FluentReact Features for Effective Sentence Mining
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Interactive Subtitles
                </h3>
                <p className="text-gray-600 text-sm">
                  Click any subtitle to jump to that moment and study the
                  sentence in context.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Vocabulary Building
                </h3>
                <p className="text-gray-600 text-sm">
                  Save interesting words and phrases to your personal vocabulary
                  list.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Smart Segmentation
                </h3>
                <p className="text-gray-600 text-sm">
                  AI-powered subtitle generation creates natural sentence breaks
                  for easy mining.
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Sentence Mining vs Flashcards: A Direct Comparison
            </h2>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">
                          Aspect
                        </th>
                        <th className="text-center py-4 px-6 font-semibold text-red-600">
                          Flashcards
                        </th>
                        <th className="text-center py-4 px-6 font-semibold text-green-600">
                          Sentence Mining
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-4 px-6 font-medium text-gray-900">
                          Context
                        </td>
                        <td className="py-4 px-6 text-center text-gray-600">
                          Isolated words
                        </td>
                        <td className="py-4 px-6 text-center text-gray-600">
                          Natural context
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-4 px-6 font-medium text-gray-900">
                          Retention
                        </td>
                        <td className="py-4 px-6 text-center text-gray-600">
                          Short-term
                        </td>
                        <td className="py-4 px-6 text-center text-gray-600">
                          Long-term
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-4 px-6 font-medium text-gray-900">
                          Usage
                        </td>
                        <td className="py-4 px-6 text-center text-gray-600">
                          Difficult to apply
                        </td>
                        <td className="py-4 px-6 text-center text-gray-600">
                          Easy to use
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-4 px-6 font-medium text-gray-900">
                          Grammar
                        </td>
                        <td className="py-4 px-6 text-center text-gray-600">
                          Separate learning
                        </td>
                        <td className="py-4 px-6 text-center text-gray-600">
                          Natural acquisition
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 font-medium text-gray-900">
                          Engagement
                        </td>
                        <td className="py-4 px-6 text-center text-gray-600">
                          Repetitive
                        </td>
                        <td className="py-4 px-6 text-center text-gray-600">
                          Interesting
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Practical Tips */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Practical Tips for Effective Sentence Mining
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Choose the Right Content
                  </h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Start with content slightly above your level</li>
                    <li>• Choose topics you're genuinely interested in</li>
                    <li>
                      • Mix different types of content (movies, podcasts,
                      courses)
                    </li>
                    <li>• Focus on natural, conversational language</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Build Your Collection
                  </h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Aim for 5-10 sentences per day</li>
                    <li>• Include both simple and complex sentences</li>
                    <li>• Note the context and situation</li>
                    <li>• Add personal translations or explanations</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Conclusion */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Transform Your Vocabulary Learning
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Sentence mining from video content represents a fundamental shift
              in how we approach vocabulary learning. Instead of memorizing
              isolated words, you're building a rich, contextual understanding
              of how language actually works in real-world situations.
            </p>
            <p className="text-gray-600 leading-relaxed">
              With FluentReact, you have the perfect tool for this approach.
              Upload any video content, extract meaningful sentences, and build
              a vocabulary collection that will serve you well in real
              conversations and situations.
            </p>
          </div>
        </article>

        {/* CTA Section */}
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start Sentence Mining Today
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Try FluentReact and experience the power of context-rich vocabulary
            learning. Transform your video content into a powerful language
            learning tool.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Start Mining Sentences
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
