import type { Metadata } from "next";
import Navigation from "@/components/home/Navigation";
import Hero from "@/components/home/Hero";
import Footer from "@/components/home/Footer";

export const metadata: Metadata = {
  title: "FinPlan India — Advisor Operating System",
  description: "Client onboarding, portfolio oversight, and review workflows for modern advisory practices.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-bone text-obsidian" data-testid="home-main">
      <Navigation />
      <div className="page-frame grain flex flex-col">
        <Hero />
      </div>
      <Footer />
    </main>
  );
}