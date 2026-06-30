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
  title: "FinPlan India — Smart Financial Planning & Goal Planning",
  description: "Institution-grade gold planning, forecasting, risk analysis and market intelligence for serious capital.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-bone text-obsidian" data-testid="home-main">
      <Navigation />
      <div className="page-frame grain">
        <div style={{ marginBottom: '20px' }}><Hero /></div>
        <div style={{ marginBottom: '20px' }}><TrustedBy /></div>
        <div style={{ marginBottom: '20px' }}><Services /></div>
        <div style={{ marginBottom: '20px' }}><Features /></div>
        <div style={{ marginBottom: '20px' }}><DashboardPreview /></div>
        <div style={{ marginBottom: '20px' }}><Process /></div>
        <div style={{ marginBottom: '20px' }}><Testimonials /></div>
        <div style={{ marginBottom: '20px' }}><Pricing /></div>
        <div style={{ marginBottom: '20px' }}><FAQ /></div>
        <div><CTA /></div>
        <Footer />
      </div>
    </main>
  );
}
