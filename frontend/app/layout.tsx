import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GoldPlan AI \u2014 Editorial Intelligence for Gold & Capital",
    template: "%s | FinPlan India",
  },
  description:
    "India's most trusted financial planning platform. Goal-based planning for retirement, education, home, tax saving, and wealth creation. SEBI-registered advisors.",
  keywords: [
    "financial planning india",
    "goal planning",
    "mutual fund advisor",
    "SIP calculator",
    "retirement planning india",
    "tax saving 80C",
    "NPS India",
    "PPF",
    "investment advisor india",
    "SEBI registered advisor",
  ],
  metadataBase: new URL("https://finplan.in"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://finplan.in",
    title: "GoldPlan AI \u2014 Editorial Intelligence for Gold & Capital",
    description: "Plan your financial goals with India's most trusted advisory platform.",
    siteName: "FinPlan India",
  },
  twitter: {
    card: "summary_large_image",
    title: "FinPlan India",
    description: "Smart financial planning & goal planning for every Indian family.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <meta name="theme-color" content="#F8F6F0" />
        <meta name="color-scheme" content="light" />
      </head>
      <body className="font-sans antialiased bg-bone text-obsidian pt-24">
        {children}
      </body>
    </html>
  );
}
