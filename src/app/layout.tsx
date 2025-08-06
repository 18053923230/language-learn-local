import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CookieConsentWrapper } from "@/components/cookie-consent-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FluentReact: The Interactive Video Player for Language Learning",
  description:
    "Turn any English video into an interactive lesson. Click subtitles to play, loop sentences, and build your vocabulary. All processing happens locally on your device for complete privacy. A powerful alternative to Language Reactor for all your video files.",
  keywords:
    "language learning, video subtitles, interactive learning, English practice, video language tool, Language Reactor alternative, local processing, privacy-first learning",
  authors: [{ name: "FluentReact Team" }],
  creator: "FluentReact",
  publisher: "FluentReact",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://fluentreact.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FluentReact: Master English with Any Video You Love",
    description:
      "Transform any video into an interactive language learning experience. All processing happens locally on your device for complete privacy.",
    type: "website",
    url: "https://fluentreact.com",
    siteName: "FluentReact",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FluentReact - Interactive Video Language Learning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FluentReact: Interactive Video Language Learning",
    description:
      "Learn languages with any video file - click subtitles, loop sentences, build vocabulary. All processing happens locally for complete privacy.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-8082CH0NRB"
        />
        <script
          id="google-analytics"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-8082CH0NRB');
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <CookieConsentWrapper />
      </body>
    </html>
  );
}
