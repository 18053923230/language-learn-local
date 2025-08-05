import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Zap,
  Globe,
  Shield,
  Mail,
  ExternalLink,
  Heart,
  Award,
  Users,
  TrendingUp,
} from "lucide-react";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer
      className={`!bg-gray-900 !text-white relative z-50 ${className}`}
      style={{
        background: "linear-gradient(to bottom, #111827, #1f2937) !important",
        position: "relative",
        zIndex: 50,
        backgroundImage: "none !important",
        isolation: "isolate",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FR</span>
              </div>
              <h3 className="text-xl font-bold text-white">FluentReact</h3>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              The most trusted interactive video language learning platform.
              Transform any video into an engaging learning experience with
              complete privacy and local processing.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge
                variant="secondary"
                className="bg-blue-600/20 text-blue-300 border-blue-600/30"
              >
                <Lock className="w-3 h-3 mr-1" />
                100% Private
              </Badge>
              <Badge
                variant="secondary"
                className="bg-green-600/20 text-green-300 border-green-600/30"
              >
                <Zap className="w-3 h-3 mr-1" />
                Free Forever
              </Badge>
              <Badge
                variant="secondary"
                className="bg-purple-600/20 text-purple-300 border-purple-600/30"
              >
                <Globe className="w-3 h-3 mr-1" />
                Works Offline
              </Badge>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Award className="w-4 h-4 mr-2" />
              Google AdSense Compliant • GDPR Compliant
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link
                  href="/"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/my-list"
                  className="hover:text-white transition-colors flex items-center"
                >
                  My Learning List
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Blog & Tips
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Help & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal & Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="mailto:260316514@qq.com"
                  className="hover:text-white transition-colors flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Us
                </a>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Learning Resources
                </Link>
              </li>
            </ul>

            {/* Contact Email */}
            <div className="mt-6 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Contact Email:</p>
              <a
                href="mailto:260316514@qq.com"
                className="text-blue-300 hover:text-blue-200 text-sm font-medium"
              >
                260316514@qq.com
              </a>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-1">50K+</div>
              <div className="text-sm text-gray-400">Videos Processed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-1">10K+</div>
              <div className="text-sm text-gray-400">Active Learners</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-1">99.9%</div>
              <div className="text-sm text-gray-400">Privacy Guaranteed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-1">24/7</div>
              <div className="text-sm text-gray-400">Available Offline</div>
            </div>
          </div>
        </div>

        {/* Advertising Disclosure */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="bg-gray-800/30 rounded-lg p-6">
            <h5 className="font-semibold text-white mb-3">
              Advertising & Data Disclosure
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div>
                <strong className="text-white">Advertising Disclosure:</strong>
                <p className="mt-1">
                  This website may display third-party advertisements through
                  Google AdSense. These ads help support the free operation of
                  this site.
                </p>
              </div>
              <div>
                <strong className="text-white">Data Collection:</strong>
                <p className="mt-1">
                  We use cookies and similar technologies to improve your
                  experience, analyze site traffic, and personalize content. By
                  continuing to use this site, you consent to our use of
                  cookies.
                </p>
              </div>
              <div>
                <strong className="text-white">Third-Party Services:</strong>
                <p className="mt-1">
                  This site uses Google Analytics and may display Google AdSense
                  advertisements. These services have their own privacy policies
                  and terms of use.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 FluentReact. All rights reserved. Made with{" "}
              <Heart className="w-4 h-4 inline text-red-400" /> for language
              learners worldwide.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span>Google AdSense Ready</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span>Trusted by 10K+ Users</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
