import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Eye, Lock, Mail } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - FluentReact",
  description:
    "Learn how FluentReact protects your privacy with local processing. Your video files never leave your device.",
  keywords:
    "privacy policy, data protection, local processing, GDPR compliance",
  openGraph: {
    title: "Privacy Policy - FluentReact",
    description:
      "Your privacy is our priority. Learn how we protect your data with local processing.",
  },
};

const privacyFeatures = [
  {
    icon: Shield,
    title: "Local Processing",
    description:
      "All video processing happens on your device. Your files never leave your computer.",
  },
  {
    icon: Eye,
    title: "No Data Collection",
    description:
      "We don't collect, store, or access your video files or personal data.",
  },
  {
    icon: Lock,
    title: "Complete Control",
    description:
      "You have full control over your data. Delete it anytime from your device.",
  },
  {
    icon: Mail,
    title: "Transparent Communication",
    description:
      "Clear information about how we handle your data and protect your privacy.",
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Last updated: January 15, 2024
          </p>
        </div>

        {/* Privacy Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Privacy Commitment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {privacyFeatures.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Privacy Policy Content */}
        <div className="space-y-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  1.1 Video Files
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  <strong>
                    We do not collect, store, or access your video files.
                  </strong>{" "}
                  All video processing happens locally in your browser on your
                  device. Your video files never leave your computer and are not
                  uploaded to our servers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  1.2 Usage Data
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We may collect anonymous usage statistics to improve our
                  service, such as:
                </p>
                <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                  <li>Pages visited on our website</li>
                  <li>Features used (without identifying specific content)</li>
                  <li>Browser type and version</li>
                  <li>Device type and screen resolution</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  1.3 Contact Information
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  If you contact us for support, we may collect your email
                  address and any information you provide in your message. This
                  information is used solely to respond to your inquiry and is
                  not shared with third parties.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                2. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  2.1 Service Improvement
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We use anonymous usage data to understand how our service is
                  used and to improve the user experience. This helps us
                  identify which features are most popular and where we can make
                  improvements.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  2.2 Customer Support
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  If you contact us for support, we use your contact information
                  to respond to your questions and provide assistance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  2.3 Legal Compliance
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We may use your information to comply with applicable laws,
                  regulations, or legal processes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                3. Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>
                  We do not sell, trade, or otherwise transfer your personal
                  information to third parties.
                </strong>
                We may share information only in the following limited
                circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>
                  <strong>Service Providers:</strong> We may use trusted
                  third-party service providers to help us operate our website
                  and provide services (e.g., hosting, analytics). These
                  providers are bound by confidentiality agreements.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose
                  information if required by law or to protect our rights,
                  property, or safety.
                </li>
                <li>
                  <strong>Business Transfers:</strong> In the event of a merger,
                  acquisition, or sale of assets, user information may be
                  transferred as part of the transaction.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                4. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  4.1 Local Processing
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Since all video processing happens locally on your device,
                  your video files are never transmitted over the internet or
                  stored on our servers. This provides the highest level of
                  security for your content.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  4.2 Website Security
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We implement appropriate security measures to protect any
                  information we collect, including:
                </p>
                <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                  <li>SSL encryption for all data transmission</li>
                  <li>Secure hosting with regular security updates</li>
                  <li>Access controls and authentication measures</li>
                  <li>Regular security audits and monitoring</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                5. Your Rights (GDPR)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                If you are a resident of the European Economic Area (EEA), you
                have certain data protection rights under the General Data
                Protection Regulation (GDPR):
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>
                  <strong>Right to Access:</strong> You can request a copy of
                  the personal data we hold about you.
                </li>
                <li>
                  <strong>Right to Rectification:</strong> You can request
                  correction of inaccurate personal data.
                </li>
                <li>
                  <strong>Right to Erasure:</strong> You can request deletion of
                  your personal data.
                </li>
                <li>
                  <strong>Right to Restrict Processing:</strong> You can request
                  limitation of how we process your data.
                </li>
                <li>
                  <strong>Right to Data Portability:</strong> You can request a
                  copy of your data in a machine-readable format.
                </li>
                <li>
                  <strong>Right to Object:</strong> You can object to our
                  processing of your personal data.
                </li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                To exercise these rights, please contact us at:{" "}
                <a
                  href="mailto:260316514@qq.com"
                  className="text-blue-600 hover:underline"
                >
                  260316514@qq.com
                </a>
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                6. Cookies and Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  6.1 Essential Cookies
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We use essential cookies to make our website function
                  properly. These cookies are necessary for the website to work
                  and cannot be disabled.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  6.2 Analytics Cookies
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We may use analytics cookies to understand how visitors use
                  our website. These cookies help us improve our service by
                  providing anonymous usage statistics.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  6.3 Cookie Management
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  You can control cookies through your browser settings.
                  However, disabling essential cookies may affect the
                  functionality of our website.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                7. Children's Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Our service is not intended for children under 13 years of age.
                We do not knowingly collect personal information from children
                under 13. If you are a parent or guardian and believe your child
                has provided us with personal information, please contact us
                immediately.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                8. Changes to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date. We encourage you
                to review this Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                9. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us:
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
            Your Privacy is Our Priority
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience language learning with complete privacy. Your video files
            stay on your device, and your data remains under your control.
          </p>
          <Link href="/">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Try FluentReact Free
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
