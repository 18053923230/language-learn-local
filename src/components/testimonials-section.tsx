"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "English Teacher",
    location: "New York, USA",
    content:
      "FluentReact has revolutionized my English teaching. My students can now learn from any video content they love, making language learning truly engaging and effective. The local processing ensures complete privacy.",
    rating: 5,
    language: "en",
    flag: "🇺🇸",
  },
  {
    name: "田中 美咲",
    role: "Language Student",
    location: "Tokyo, Japan",
    content:
      "FluentReactのおかげで、好きな動画で英語を学べるようになりました。字幕をクリックして発音を練習できるのが最高です！プライバシーも完全に保護されているので安心です。",
    rating: 5,
    language: "ja",
    flag: "🇯🇵",
  },
  {
    name: "Kim Min-seok",
    role: "Software Developer",
    location: "Seoul, South Korea",
    content:
      "FluentReact은 제가 본 최고의 언어 학습 도구입니다. 개인 비디오 파일로 학습할 수 있어서 정말 유용해요. 오프라인에서도 작동하고 데이터가 로컬에서 처리되어 안전합니다.",
    rating: 5,
    language: "ko",
    flag: "🇰🇷",
  },
  {
    name: "Maria Rodriguez",
    role: "University Student",
    location: "Madrid, Spain",
    content:
      "FluentReact me ha ayudado a mejorar mi inglés de manera increíble. Puedo aprender con cualquier video que me guste, ¡es fantástico! El procesamiento local garantiza mi privacidad total.",
    rating: 5,
    language: "es",
    flag: "🇪🇸",
  },
  {
    name: "Pierre Dubois",
    role: "Business Consultant",
    location: "Paris, France",
    content:
      "FluentReact a transformé mon apprentissage de l'anglais. Je peux maintenant étudier avec n'importe quelle vidéo, et le traitement local protège parfaitement ma vie privée. C'est révolutionnaire !",
    rating: 5,
    language: "fr",
    flag: "🇫🇷",
  },
  {
    name: "Hans Mueller",
    role: "Engineer",
    location: "Berlin, Germany",
    content:
      "FluentReact ist das beste Sprachlern-Tool, das ich je verwendet habe. Ich kann mit meinen eigenen Videos lernen und die lokale Verarbeitung schützt meine Privatsphäre perfekt.",
    rating: 5,
    language: "de",
    flag: "🇩🇪",
  },
  {
    name: "Alessandro Rossi",
    role: "Designer",
    location: "Milan, Italy",
    content:
      "FluentReact ha cambiato il modo in cui imparo l'inglese. Posso studiare con qualsiasi video e il processamento locale garantisce la massima privacy. È semplicemente perfetto!",
    rating: 5,
    language: "it",
    flag: "🇮🇹",
  },
  {
    name: "Olga Petrov",
    role: "Marketing Manager",
    location: "Moscow, Russia",
    content:
      "FluentReact изменил мой подход к изучению английского языка. Я могу учиться с любым видео, а локальная обработка обеспечивает полную конфиденциальность. Это просто отлично!",
    rating: 5,
    language: "ru",
    flag: "🇷🇺",
  },
];

export function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm">
            <Quote className="w-4 h-4 mr-2" />
            Global User Reviews
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by Language Learners Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of students who have transformed their language
            learning with FluentReact
          </p>
        </div>

        <div className="relative">
          {/* Navigation Dots */}
          <div className="flex justify-center mb-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full mx-1 transition-all duration-300 ${
                  index === currentTestimonial
                    ? "bg-blue-600 scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Main Testimonial Card */}
          <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-12 text-center relative">
              {/* Navigation Arrows */}
              <button
                onClick={prevTestimonial}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={nextTestimonial}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>

              {/* Quote Icon */}
              <Quote className="w-12 h-12 text-blue-600 mx-auto mb-6" />

              {/* Testimonial Content */}
              <div className="mb-8">
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  "{testimonials[currentTestimonial].content}"
                </p>

                {/* Rating */}
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    )
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex items-center justify-center space-x-4">
                <div className="text-3xl">
                  {testimonials[currentTestimonial].flag}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 text-lg">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[currentTestimonial].role} •{" "}
                    {testimonials[currentTestimonial].location}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language Badges */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((testimonial, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  index === currentTestimonial
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {testimonial.flag} {testimonial.language.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">50,000+</div>
            <div className="text-gray-600">Videos Processed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              10,000+
            </div>
            <div className="text-gray-600">Active Learners</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
            <div className="text-gray-600">Privacy Guaranteed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">8</div>
            <div className="text-gray-600">Languages Supported</div>
          </div>
        </div>
      </div>
    </section>
  );
}
