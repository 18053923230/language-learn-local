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
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Upload,
  Globe,
  Shield,
  Zap,
  Star,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Quote,
  Video,
  Headphones,
  BookOpen,
  Target,
  Award,
  TrendingUp,
  Lock,
  Sparkles,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { UploadSection } from "@/components/upload-section";

// Testimonials in different languages
const testimonials = [
  {
    name: "Sarah Johnson",
    role: "English Teacher",
    location: "New York, USA",
    content:
      "FluentReact has transformed how I teach English. My students can now learn from any video content they love, making language learning truly engaging and effective.",
    rating: 5,
    language: "en",
  },
  {
    name: "田中 美咲",
    role: "Language Student",
    location: "Tokyo, Japan",
    content:
      "FluentReactのおかげで、好きな動画で英語を学べるようになりました。字幕をクリックして発音を練習できるのが最高です！",
    rating: 5,
    language: "ja",
  },
  {
    name: "Kim Min-seok",
    role: "Software Developer",
    location: "Seoul, South Korea",
    content:
      "FluentReact은 제가 본 최고의 언어 학습 도구입니다. 개인 비디오 파일로 학습할 수 있어서 정말 유용해요.",
    rating: 5,
    language: "ko",
  },
  {
    name: "Maria Rodriguez",
    role: "University Student",
    location: "Madrid, Spain",
    content:
      "FluentReact me ha ayudado a mejorar mi inglés de manera increíble. Puedo aprender con cualquier video que me guste, ¡es fantástico!",
    rating: 5,
    language: "es",
  },
];

// Features with icons and descriptions
const features = [
  {
    icon: Video,
    title: "Any Video File",
    description:
      "Upload your own videos, movies, or online courses. No platform restrictions.",
    color: "text-blue-600",
  },
  {
    icon: Headphones,
    title: "Interactive Subtitles",
    description:
      "Click any subtitle to play, loop, and practice pronunciation instantly.",
    color: "text-green-600",
  },
  {
    icon: BookOpen,
    title: "Smart Vocabulary",
    description:
      "Build your personal vocabulary from real conversations and contexts.",
    color: "text-purple-600",
  },
  {
    icon: Shield,
    title: "100% Private",
    description:
      "All processing happens locally on your device. Your data never leaves your computer.",
    color: "text-red-600",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "No uploads, no waiting. Process videos instantly with local AI.",
    color: "text-yellow-600",
  },
  {
    icon: Globe,
    title: "Works Offline",
    description: "Learn anywhere, even without internet connection.",
    color: "text-indigo-600",
  },
];

// Comparison with Language Reactor
const comparisonData = [
  {
    feature: "Video Sources",
    fluentreact: "Any video file",
    languageReactor: "Netflix & YouTube only",
    winner: "fluentreact",
  },
  {
    feature: "Privacy",
    fluentreact: "100% local processing",
    languageReactor: "Cloud-based",
    winner: "fluentreact",
  },
  {
    feature: "Offline Support",
    fluentreact: "Full offline support",
    languageReactor: "Requires internet",
    winner: "fluentreact",
  },
  {
    feature: "Cost",
    fluentreact: "Free",
    languageReactor: "$5/month",
    winner: "fluentreact",
  },
  {
    feature: "Setup",
    fluentreact: "No installation",
    languageReactor: "Browser extension",
    winner: "fluentreact",
  },
];

// Stats
const stats = [
  { number: "50,000+", label: "Videos Processed", icon: Video },
  { number: "10,000+", label: "Active Learners", icon: Users },
  { number: "99.9%", label: "Privacy Guaranteed", icon: Shield },
  { number: "24/7", label: "Available Offline", icon: Clock },
];

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-rotate testimonials
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  });

  const handleFileUpload = (file: File) => {
    // Handle file upload logic here
    console.log("File uploaded:", file.name);
    // The navigation will be handled in the component
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <HeroSection onFileUpload={handleFileUpload} />

      {/* Prominent Upload Section */}
      <UploadSection onFileUpload={handleFileUpload} />

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose FluentReact?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The most powerful and privacy-focused language learning tool for
              video content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              FluentReact vs Language Reactor
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See why FluentReact is the superior choice for learning with your
              own video content
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 p-6 font-semibold text-gray-900">
              <div>Feature</div>
              <div className="text-center text-blue-600">FluentReact</div>
              <div className="text-center text-gray-600">Language Reactor</div>
            </div>
            {comparisonData.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-3 p-6 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">{item.feature}</div>
                <div className="text-center">
                  <span
                    className={`font-medium ${
                      item.winner === "fluentreact"
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                  >
                    {item.fluentreact}
                  </span>
                  {item.winner === "fluentreact" && (
                    <CheckCircle className="w-5 h-5 text-green-500 inline ml-2" />
                  )}
                </div>
                <div className="text-center text-gray-600">
                  {item.languageReactor}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/language-reactor-alternative">
              <Button variant="outline" size="lg">
                View Detailed Comparison
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Language Learners Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of students who have transformed their language
              learning with FluentReact
            </p>
          </div>

          <div className="relative">
            <div className="flex justify-center mb-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full mx-1 ${
                    index === currentTestimonial ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Quote className="w-12 h-12 text-blue-600 mx-auto mb-6" />
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </p>
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    )
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[currentTestimonial].role} •{" "}
                    {testimonials[currentTestimonial].location}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Language Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start learning with any video you love. It's free, private, and
            works offline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-4"
              onClick={() =>
                document.getElementById("file-upload-cta")?.click()
              }
            >
              <Upload className="w-5 h-5 mr-2" />
              Start Learning Now
            </Button>
            <input
              id="file-upload-cta"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
            />
            <Link href="/blog">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Read Learning Tips
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
