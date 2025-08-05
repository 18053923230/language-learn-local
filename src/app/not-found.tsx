import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { Home, Search, HelpCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-white text-6xl font-bold">404</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Page Not Found
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Oops! The page you're looking for doesn't exist. It might have
              been moved, deleted, or you entered the wrong URL.
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <Link href="/">
                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </Button>
              </Link>

              <Link href="/help">
                <Button
                  variant="outline"
                  className="w-full h-12 border-blue-300 text-blue-600 hover:bg-blue-50 font-semibold rounded-xl transition-all duration-200"
                >
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Get Help
                </Button>
              </Link>

              <Link href="/blog">
                <Button
                  variant="outline"
                  className="w-full h-12 border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl transition-all duration-200"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Browse Blog
                </Button>
              </Link>
            </div>

            {/* Popular Pages */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Popular Pages
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/how-it-works" className="group">
                  <div className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group-hover:shadow-md">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      How It Works
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Learn how FluentReact transforms videos into learning
                      experiences
                    </p>
                  </div>
                </Link>

                <Link href="/language-reactor-alternative" className="group">
                  <div className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group-hover:shadow-md">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Language Reactor Alternative
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Discover why FluentReact is the best alternative
                    </p>
                  </div>
                </Link>

                <Link href="/faq" className="group">
                  <div className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group-hover:shadow-md">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      FAQ
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Find answers to frequently asked questions
                    </p>
                  </div>
                </Link>

                <Link href="/blog" className="group">
                  <div className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group-hover:shadow-md">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Learning Tips
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Explore our latest language learning articles
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Still Can't Find What You're Looking For?
              </h3>
              <p className="text-gray-600 mb-4">
                Contact us and we'll help you find the right page or feature.
              </p>
              <a
                href="mailto:260316514@qq.com"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2 rotate-180" />
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
