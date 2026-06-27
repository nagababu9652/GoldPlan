import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GoldPlan AI — Editorial Intelligence for Gold & Capital",
    template: "%s | GoldPlan AI"
  },
  description: "GoldPlan AI delivers institution-grade reports, forecasting, and risk intelligence for precious metals and capital allocation.",
  keywords: ["gold analysis", "financial planning", "investment reports", "risk assessment", "AI analytics", "fintech"],
  metadataBase: new URL("https://goldplan.ai"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://goldplan.ai",
    title: "GoldPlan AI — Editorial Intelligence for Gold & Capital",
    description: "Smarter gold planning for smarter businesses.",
    siteName: "GoldPlan AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoldPlan AI",
    description: "Editorial intelligence for gold & capital.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#F8F6F0" />
        <meta name="color-scheme" content="light" />
      </head>
      <body className="antialiased bg-bone text-obsidian">
        {children}
      </body>
    </html>
  );
}
