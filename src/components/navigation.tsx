"use client";

import { Button } from "@/components/ui/button";
import { BookOpen, Download, Settings, HelpCircle } from "lucide-react";
import Link from "next/link";

interface NavigationProps {
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
  title?: string;
  titleIcon?: React.ReactNode;
  titleGradient?: string;
}

export function Navigation({
  showBackButton = false,
  backButtonText = "Back to Video",
  backButtonHref = "/",
  title,
  titleIcon,
  titleGradient = "from-blue-600 to-blue-800",
}: NavigationProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Link href={backButtonHref}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="education-button-secondary"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  {backButtonText}
                </Button>
              </Link>
            )}

            {title && (
              <div className="flex items-center space-x-3">
                {titleIcon && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    {titleIcon}
                  </div>
                )}
                <h1
                  className={`text-xl font-bold bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent`}
                >
                  {title}
                </h1>
              </div>
            )}

            {!title && (
              <Link href="/">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">FR</span>
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    FluentReact
                  </h1>
                </div>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/help">
              <Button
                variant="outline"
                size="sm"
                className="education-button-secondary"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                How to Start?
              </Button>
            </Link>
            <Link href="/vocabulary">
              <Button
                variant="outline"
                size="sm"
                className="education-button-secondary"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Vocabulary
              </Button>
            </Link>
            <Link href="/subtitles">
              <Button
                variant="outline"
                size="sm"
                className="education-button-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                Subtitles
              </Button>
            </Link>
            <Link href="/my-list">
              <Button
                variant="outline"
                size="sm"
                className="education-button-secondary"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                My List
              </Button>
            </Link>
            <Link href="/blog">
              <Button
                variant="outline"
                size="sm"
                className="education-button-secondary"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Blog
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
