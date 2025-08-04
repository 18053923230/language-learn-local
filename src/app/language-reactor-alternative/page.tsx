import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, X, Shield, Zap, Globe, Download } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "FluentReact: The Best Language Reactor Alternative for Your Video Files",
  description:
    "Language Reactor is great for Netflix and YouTube, but what about your local video files? FluentReact works with any video file, processes everything locally for complete privacy.",
  keywords:
    "Language Reactor alternative, video language learning, local video files, privacy-first learning, Language Reactor vs FluentReact",
  openGraph: {
    title: "FluentReact: The Best Language Reactor Alternative",
    description:
      "Learn with any video file - not just Netflix and YouTube. Complete privacy with local processing.",
  },
};

const comparisonData = [
  {
    feature: "Supported Platforms",
    languageReactor: "Netflix, YouTube",
    fluentReact: "Any video file",
    fluentReactBetter: true,
  },
  {
    feature: "File Types",
    languageReactor: "Streaming only",
    fluentReact: "MP4, AVI, MOV, MKV, etc.",
    fluentReactBetter: true,
  },
  {
    feature: "Privacy",
    languageReactor: "Browser extension",
    fluentReact: "Local processing",
    fluentReactBetter: true,
  },
  {
    feature: "Offline Support",
    languageReactor: "❌",
    fluentReact: "✅",
    fluentReactBetter: true,
  },
  {
    feature: "Your Own Content",
    languageReactor: "❌",
    fluentReact: "✅",
    fluentReactBetter: true,
  },
  {
    feature: "No Upload Required",
    languageReactor: "❌",
    fluentReact: "✅",
    fluentReactBetter: true,
  },
  {
    feature: "Cost",
    languageReactor: "$5/month",
    fluentReact: "Free",
    fluentReactBetter: true,
  },
  {
    feature: "Setup Required",
    languageReactor: "Browser extension",
    fluentReact: "None - works in browser",
    fluentReactBetter: true,
  },
];

const useCases = [
  {
    title: "Your Movie Collection",
    description:
      "Learn from your downloaded movies, TV shows, and documentaries",
    icon: Download,
  },
  {
    title: "Online Courses",
    description:
      "Download course videos and create interactive learning experiences",
    icon: Globe,
  },
  {
    title: "Personal Videos",
    description: "Practice with your own recorded content or family videos",
    icon: Shield,
  },
  {
    title: "Educational Content",
    description: "Transform any educational video into an interactive lesson",
    icon: Zap,
  },
];

export default function LanguageReactorAlternativePage() {
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
            FluentReact: The Best Language Reactor Alternative
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            <strong className="text-blue-600">
              Language Reactor is a fantastic tool for Netflix and YouTube.
            </strong>
            But what about your local video files, online courses, or movie
            collection? FluentReact works with any video file you have, giving
            you complete control over your learning content.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto">
            <p className="text-blue-800 font-medium">
              🎯 <strong>Key Difference:</strong> Language Reactor enhances
              streaming platforms. FluentReact works with your own video files
              for complete privacy and control.
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <Card className="mb-16 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Language Reactor vs FluentReact
            </CardTitle>
            <CardDescription className="text-lg">
              See how FluentReact complements Language Reactor by filling the
              gaps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">
                      Feature
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">
                      Language Reactor
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-blue-600">
                      FluentReact
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {row.feature}
                      </td>
                      <td className="py-4 px-6 text-center text-gray-600">
                        {row.languageReactor}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-blue-600 font-medium">
                            {row.fluentReact}
                          </span>
                          {row.fluentReactBetter && (
                            <Check className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            What Can You Learn With FluentReact?
          </h2>
          <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            While Language Reactor is limited to streaming platforms,
            FluentReact opens up a world of possibilities with your own video
            content.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow"
              >
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <useCase.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {useCase.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600 leading-relaxed">
                    {useCase.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Privacy Section */}
        <Card className="mb-16 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Complete Privacy with Local Processing
            </CardTitle>
            <CardDescription className="text-lg">
              Unlike browser extensions, FluentReact processes everything
              locally on your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Your Videos Stay Local
                </h3>
                <p className="text-gray-600 text-sm">
                  No uploads, no cloud storage, no data sharing
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Instant Processing
                </h3>
                <p className="text-gray-600 text-sm">
                  No waiting for uploads or downloads
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Works Offline
                </h3>
                <p className="text-gray-600 text-sm">
                  Learn anywhere, even without internet
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Learn with Your Own Videos?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Don't limit yourself to streaming platforms. FluentReact works with
            any video file you have, giving you complete control over your
            learning content and privacy.
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
          <p className="text-sm text-gray-500 mt-6">
            No registration required • Works in your browser • Complete privacy
          </p>
        </div>
      </main>
    </div>
  );
}
