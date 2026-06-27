import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GoldPlan AI - AI-Powered Financial Planning",
    template: "%s | GoldPlan AI"
  },
  description: "Transform your financial strategy with AI-powered gold planning reports, investment forecasting, risk analysis, and real-time market intelligence.",
  keywords: ["financial planning", "gold analysis", "investment reports", "risk assessment", "AI analytics"],
  metadataBase: new URL("https://goldplan.ai"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://goldplan.ai",
    title: "GoldPlan AI - AI-Powered Financial Planning",
    description: "Smarter Gold Planning for Smarter Businesses",
    siteName: "GoldPlan AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoldPlan AI",
    description: "AI-Powered Financial Planning Platform",
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
        <meta name="theme-color" content="#050816" />
        <meta name="color-scheme" content="dark" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "GoldPlan AI",
              description: "AI-powered financial planning platform",
              url: "https://goldplan.ai",
              applicationCategory: "FinanceApplication"
            })
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

