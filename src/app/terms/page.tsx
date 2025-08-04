import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - FluentReact",
  description:
    "Read our terms of service to understand your rights and responsibilities when using FluentReact.",
  keywords: "terms of service, user agreement, legal terms, FluentReact terms",
  openGraph: {
    title: "Terms of Service - FluentReact",
    description: "Your rights and responsibilities when using FluentReact.",
  },
};

export default function TermsPage() {
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
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600">
            Last updated: January 15, 2024
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using FluentReact ("the Service"), you accept
                and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do
                not use this service.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                2. Description of Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed mb-4">
                FluentReact is an interactive video language learning platform
                that allows users to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>
                  Upload and process video files for language learning purposes
                </li>
                <li>Generate subtitles and interactive learning content</li>
                <li>Practice language skills through video content</li>
                <li>Build vocabulary and improve pronunciation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                3. User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  3.1 Content Ownership
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  You are responsible for ensuring you have the right to use any
                  video content you upload to FluentReact. You must only upload
                  content that you own or have permission to use for educational
                  purposes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  3.2 Acceptable Use
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  You agree to use the Service only for lawful purposes and in
                  accordance with these Terms. You agree not to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-2">
                  <li>
                    Upload content that infringes on intellectual property
                    rights
                  </li>
                  <li>
                    Use the Service for any illegal or unauthorized purpose
                  </li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Upload malicious software or content</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  3.3 Educational Use
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  FluentReact is designed for educational purposes. You agree to
                  use the Service for language learning and educational
                  activities only.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                4. Privacy and Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed mb-4">
                Your privacy is important to us. Our privacy practices are
                described in our
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:underline mx-1"
                >
                  Privacy Policy
                </Link>
                , which is incorporated into these Terms by reference.
              </p>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Local Processing
                    </h4>
                    <p className="text-blue-700 text-sm">
                      All video processing happens locally on your device. Your
                      video files never leave your computer and are not stored
                      on our servers.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                5. Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  5.1 Your Content
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  You retain ownership of any content you upload to FluentReact.
                  We do not claim ownership of your video files or any content
                  you create using our Service.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  5.2 Our Service
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  FluentReact, including its software, design, and content, is
                  owned by us and protected by intellectual property laws. You
                  may not copy, modify, or distribute our Service without
                  permission.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                6. Disclaimers and Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      Service Availability
                    </h4>
                    <p className="text-yellow-700 text-sm">
                      FluentReact is provided "as is" without warranties of any
                      kind. We do not guarantee that the Service will be
                      uninterrupted or error-free.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  6.1 Educational Tool
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  FluentReact is an educational tool and should not be
                  considered a substitute for professional language instruction.
                  Results may vary based on individual effort and learning
                  style.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  6.2 Limitation of Liability
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  To the maximum extent permitted by law, FluentReact shall not
                  be liable for any indirect, incidental, special,
                  consequential, or punitive damages resulting from your use of
                  the Service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                7. Termination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may terminate or suspend your access to the Service
                immediately, without prior notice, for any reason, including if
                you breach these Terms.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Upon termination, your right to use the Service will cease
                immediately. All data stored locally on your device will remain
                under your control.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                8. Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will
                notify users of any material changes by posting the new Terms on
                this page and updating the "Last updated" date. Your continued
                use of the Service after such changes constitutes acceptance of
                the new Terms.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                9. Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                These Terms shall be governed by and construed in accordance
                with the laws of the jurisdiction in which FluentReact operates,
                without regard to its conflict of law provisions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                10. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please
                contact us:
              </p>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:260316514@qq.com"
                    className="text-blue-600 hover:underline"
                  >
                    260316514@qq.com
                  </a>
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Website:</strong>{" "}
                  <a
                    href="https://fluentreact.com"
                    className="text-blue-600 hover:underline"
                  >
                    https://fluentreact.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            By using FluentReact, you agree to these terms. Start your language
            learning journey today with complete privacy and control over your
            content.
          </p>
          <Link href="/">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Get Started with FluentReact
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
