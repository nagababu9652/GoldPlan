import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FinPlanGuide } from "@/components/assistant";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FinPlan",
    template: "%s | FinPlan",
  },
  description: "Financial Advisory Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-bone text-obsidian antialiased`}
      >
        {children}

        <FinPlanGuide />
      </body>
    </html>
  );
}