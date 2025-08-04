import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog - FluentReact Language Learning Tips & Tutorials",
  description:
    "Learn effective language learning techniques, video-based learning strategies, and how to use FluentReact for maximum results. Expert tips for mastering languages with video content.",
  keywords:
    "language learning blog, video learning tips, FluentReact tutorials, language learning techniques, English learning",
  openGraph: {
    title: "FluentReact Blog - Language Learning Tips & Tutorials",
    description:
      "Expert language learning tips and FluentReact tutorials to help you master languages with video content.",
  },
};

const blogPosts = [
  {
    id: "how-to-use-video-files",
    title:
      "How to Use Your Own Video Files for Language Learning (When Language Reactor Can't)",
    excerpt:
      "Discover how to transform your personal video collection into powerful language learning tools. Learn why local video files offer unique advantages over streaming platforms.",
    category: "Tutorial",
    readTime: "8 min read",
    publishDate: "2024-01-15",
    tags: ["video learning", "local files", "Language Reactor alternative"],
    featured: true,
    slug: "how-to-use-video-files",
  },
  {
    id: "shadowing-technique",
    title: "A Step-by-Step Guide to Shadowing with Videos",
    excerpt:
      "Master the shadowing technique using video content. Learn how to improve pronunciation, rhythm, and fluency by following along with native speakers in your favorite videos.",
    category: "Technique",
    readTime: "12 min read",
    publishDate: "2024-01-10",
    tags: ["shadowing", "pronunciation", "fluency"],
    featured: false,
    slug: "shadowing-technique",
  },
  {
    id: "sentence-mining",
    title: "Why Sentence Mining is More Effective Than Flashcards",
    excerpt:
      "Discover why sentence mining from video content is superior to traditional flashcard methods. Learn how context and real-world usage make vocabulary stick better.",
    category: "Methodology",
    readTime: "10 min read",
    publishDate: "2024-01-05",
    tags: ["sentence mining", "vocabulary", "context learning"],
    featured: false,
    slug: "sentence-mining",
  },
  {
    id: "youtube-channels",
    title:
      "Top 10 YouTube Channels for English Listening Practice (and how to use them with FluentReact)",
    excerpt:
      "Explore the best YouTube channels for English learning and learn how to download and process them with FluentReact for maximum learning effectiveness.",
    category: "Resources",
    readTime: "15 min read",
    publishDate: "2024-01-01",
    tags: ["YouTube", "listening practice", "resources"],
    featured: false,
    slug: "youtube-channels",
  },
  {
    id: "listening-comprehension",
    title:
      "Tired of Constantly Rewinding? How to Improve Your Listening Comprehension Faster",
    excerpt:
      "Stop the endless rewinding cycle. Learn proven techniques to improve your listening comprehension and understand native speakers more easily.",
    category: "Technique",
    readTime: "9 min read",
    publishDate: "2023-12-28",
    tags: ["listening", "comprehension", "native speakers"],
    featured: false,
    slug: "listening-comprehension",
  },
  {
    id: "privacy-language-learning",
    title:
      "Why Privacy Matters in Language Learning (And How FluentReact Protects Yours)",
    excerpt:
      "Understand why privacy is crucial for effective language learning and how local processing keeps your learning data secure and private.",
    category: "Privacy",
    readTime: "6 min read",
    publishDate: "2023-12-25",
    tags: ["privacy", "local processing", "data security"],
    featured: false,
    slug: "privacy-language-learning",
  },
];

const categories = [
  "All",
  "Tutorial",
  "Technique",
  "Methodology",
  "Resources",
  "Privacy",
];

export default function BlogPage() {
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
            FluentReact Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Expert language learning tips, tutorials, and strategies to help you
            master languages with video content. Learn how to use FluentReact
            effectively and discover proven techniques for faster language
            acquisition.
          </p>
        </div>

        {/* Featured Post */}
        {blogPosts
          .filter((post) => post.featured)
          .map((post) => (
            <Card
              key={post.id}
              className="mb-12 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 overflow-hidden"
            >
              <CardHeader className="text-center">
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full mb-4">
                  Featured Article
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(post.publishDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {post.readTime}
                  </div>
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-2" />
                    {post.category}
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/60 text-gray-600 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <Link href={`/blog/${post.slug}`}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    Read Full Article
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts
            .filter((post) => !post.featured)
            .map((post) => (
              <Card
                key={post.id}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {post.readTime}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-3">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {new Date(post.publishDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Put These Tips Into Practice?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Try FluentReact today and experience the power of interactive video
            language learning. All processing happens locally on your device for
            complete privacy.
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
