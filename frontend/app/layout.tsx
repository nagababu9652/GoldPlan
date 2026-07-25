import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FinPlan India — Advisor Operating System",
    template: "%s | FinPlan India",
  },
  description:
    "Client onboarding, portfolio oversight, and review workflows for modern advisory practices.",
  keywords: [
    "advisor platform india",
    "client onboarding",
    "portfolio management",
    "SEBI registered advisor",
    "financial advisory software",
    "client management",
    "advisor dashboard",
    "review workflows",
  ],
  metadataBase: new URL("https://finplan.in"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://finplan.in",
    title: "FinPlan India — Advisor Operating System",
    description: "Client onboarding, portfolio oversight, and review workflows for modern advisory practices.",
    siteName: "FinPlan India",
  },
  twitter: {
    card: "summary_large_image",
    title: "FinPlan India — Advisor Operating System",
    description: "Modern advisory platform for client onboarding, portfolio oversight, and review workflows.",
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
      data-scroll-behavior="smooth"
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
