import type { Metadata } from "next";
import { FAQClient } from "./faq-client";

export const metadata: Metadata = {
  title: "FAQ - FluentReact Interactive Video Language Learning",
  description:
    "Frequently asked questions about FluentReact. Learn about video formats, privacy, accuracy, and how it differs from Language Reactor.",
  keywords:
    "FluentReact FAQ, video language learning questions, privacy, video formats, Language Reactor comparison",
  openGraph: {
    title: "FluentReact FAQ - Common Questions Answered",
    description:
      "Everything you need to know about FluentReact's interactive video language learning platform.",
  },
};

const faqs = [
  {
    question: "Is FluentReact free?",
    answer:
      "Yes, FluentReact is currently free to use. We're focused on building the best tool for language learners and making it accessible to everyone.",
    category: "Pricing",
  },
  {
    question: "What video formats are supported?",
    answer:
      "We support most common video formats including MP4, AVI, MOV, MKV, WebM, and more. If your browser can play it, FluentReact can process it.",
    category: "Technical",
  },
  {
    question: "How accurate are the subtitles?",
    answer:
      "We use advanced AI transcription technology that provides highly accurate subtitles, especially for clear speech. The accuracy depends on audio quality and speech clarity.",
    category: "Technical",
  },
  {
    question: "How is FluentReact different from Language Reactor?",
    answer:
      "Language Reactor works with Netflix and YouTube through a browser extension. FluentReact works with any video file you have, processes everything locally on your device for complete privacy, and doesn't require any browser extensions.",
    category: "Comparison",
  },
  {
    question: "Can I use FluentReact offline?",
    answer:
      "Yes! All processing happens locally on your device, so you can learn without an internet connection. You only need internet for the initial page load.",
    category: "Privacy",
  },
  {
    question: "Do you upload my videos to your servers?",
    answer:
      "No, absolutely not. All video processing happens locally in your browser. Your videos never leave your device, ensuring complete privacy.",
    category: "Privacy",
  },
  {
    question: "What languages are supported?",
    answer:
      "Currently, we support English transcription and learning. We're working on adding support for more languages in the future.",
    category: "Technical",
  },
  {
    question: "Can I save my vocabulary and progress?",
    answer:
      "Yes! All your vocabulary, subtitles, and learning progress are saved locally in your browser. Your data stays with you.",
    category: "Features",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "There's no strict file size limit, but larger files will take longer to process. We recommend videos under 2GB for optimal performance.",
    category: "Technical",
  },
  {
    question: "Can I use FluentReact on mobile?",
    answer:
      "FluentReact works best on desktop and laptop computers due to the processing requirements. Mobile support is planned for future updates.",
    category: "Technical",
  },
  {
    question: "How do I get the best results?",
    answer:
      "For best results, use videos with clear audio, minimal background noise, and good speech quality. HD videos with stereo audio work best.",
    category: "Tips",
  },
  {
    question: "Can I export my vocabulary or subtitles?",
    answer:
      "Yes! You can export your vocabulary lists and subtitle files for use in other applications or for backup purposes.",
    category: "Features",
  },
];

const categories = [
  "All",
  "Technical",
  "Privacy",
  "Features",
  "Pricing",
  "Comparison",
  "Tips",
];

export default function FAQPage() {
  return <FAQClient />;
}
