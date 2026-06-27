import type { Metadata } from "next";
import Navigation from "@/components/home/Navigation";
import Hero from "@/components/home/Hero";
import TrustedBy from "@/components/home/TrustedBy";
import Services from "@/components/home/Services";
import Features from "@/components/home/Features";
import DashboardPreview from "@/components/home/DashboardPreview";
import Process from "@/components/home/Process";
import Testimonials from "@/components/home/Testimonials";
import Pricing from "@/components/home/Pricing";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";
import Footer from "@/components/home/Footer";

export const metadata: Metadata = {
  title: "GoldPlan AI - AI-Powered Financial Planning & Gold Analysis",
  description: "Transform your financial strategy with AI-powered gold planning reports, investment forecasting, risk analysis, and real-time market intelligence. Trusted by investment professionals worldwide.",
  keywords: "gold planning, financial reports, investment analysis, risk assessment, portfolio optimization, AI analytics, fintech",
  openGraph: {
    title: "GoldPlan AI - Enterprise Financial Planning Platform",
    description: "AI-powered gold planning and financial analysis for businesses",
    url: "https://goldplan.ai",
    type: "website",
    images: [
      {
        url: "https://goldplan.ai/og-image.png",
        width: 1200,
        height: 630,
        alt: "GoldPlan AI Platform",
      }
    ]
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navigation />
      <div className="page-container">
        <Hero />
        <TrustedBy />
        <Services />
        <Features />
        <DashboardPreview />
        <Process />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
