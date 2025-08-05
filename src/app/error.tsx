"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl">
              <AlertTriangle className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Something Went Wrong
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We're sorry, but something unexpected happened. Our team has been
              notified and we're working to fix it.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <h3 className="font-semibold text-red-800 mb-2">
                  Error Details:
                </h3>
                <p className="text-sm text-red-700 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={reset}
                className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </Button>

              <Link href="/">
                <Button
                  variant="outline"
                  className="h-12 border-blue-300 text-blue-600 hover:bg-blue-50 font-semibold rounded-xl transition-all duration-200"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </Button>
              </Link>
            </div>

            {/* Help Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Need Help?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Common Solutions
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Refresh the page</li>
                    <li>• Clear your browser cache</li>
                    <li>• Try a different browser</li>
                    <li>• Check your internet connection</li>
                  </ul>
                </div>

                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Contact Support
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    If the problem persists, contact our support team.
                  </p>
                  <a
                    href="mailto:260316514@qq.com"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                  >
                    Email Support
                  </a>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                If you continue to experience issues, please include the error
                ID:{" "}
                <span className="font-mono text-gray-800">
                  {error.digest || "N/A"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
