import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Learning List - FluentReact",
  description:
    "Manage and continue your language learning projects. Track your progress, vocabulary, and learning history with FluentReact's interactive video learning platform.",
  keywords:
    "learning list, language projects, learning progress, vocabulary tracking, video learning history, FluentReact",
  openGraph: {
    title: "My Learning List - FluentReact",
    description:
      "Manage and continue your language learning projects. Track your progress and vocabulary.",
    type: "website",
    url: "https://fluentreact.com/my-list",
  },
  twitter: {
    card: "summary",
    title: "My Learning List - FluentReact",
    description: "Manage and continue your language learning projects.",
  },
  robots: {
    index: false, // Don't index personal learning lists
    follow: false,
  },
};

export default function MyListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
