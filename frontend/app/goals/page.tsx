'use client';

import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { Target, TrendingUp, Home, GraduationCap, Shield, Heart, PiggyBank, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const goalsList = [
  {
    title: 'Retirement Planning',
    description: 'NPS, PPF, EPF and mutual funds for a stress-free retirement. Plan your golden years with confidence.',
    href: '/goals/retirement',
    icon: PiggyBank,
    items: ['NPS Calculator', 'Pension Planning', 'Tax Benefits (80CCD)', 'Withdrawal Strategy'],
  },
  {
    title: 'Child Education',
    description: 'Beat inflation with inflation-adjusted education fund planning. Secure your child\'s future today.',
    href: '/goals/education',
    icon: GraduationCap,
    items: ['Education Cost Calculator', 'Sukanya Samriddhi Yojana', 'Goal-based Investing', 'Insurance Planning'],
  },
  {
    title: 'Home Purchase',
    description: 'Plan your down payment, compare home loan options and maximise 80C/24(b) tax benefits.',
    href: '/goals/home',
    icon: Home,
    items: ['Down Payment Calculator', 'Home Loan Comparison', 'Tax Benefits', 'EMI Planning'],
  },
  {
    title: 'Wealth Creation',
    description: 'Long-term SIP strategies across equity, hybrid and index funds. Build lasting wealth.',
    href: '/goals/wealth',
    icon: TrendingUp,
    items: ['SIP Strategies', 'Portfolio Rebalancing', 'Asset Allocation', 'Tax Harvesting'],
  },
  {
    title: 'Term Life Insurance',
    description: 'Compare and optimise term cover across top Indian insurers. Protect what matters most.',
    href: '/protection/term-life',
    icon: Shield,
    items: ['Coverage Calculator', 'Premium Comparison', 'Claim Settlement Ratio', 'Rider Benefits'],
  },
  {
    title: 'Health Insurance',
    description: 'Family floater, critical illness and top-up plans. Comprehensive health coverage for your family.',
    href: '/protection/health',
    icon: Heart,
    items: ['Family Floater Plans', 'Critical Illness Cover', 'Senior Citizen Plans', 'Tax Benefits (80D)'],
  },
];

export default function GoalsPage() {
  return (
    <main className="min-h-screen bg-bone text-obsidian" data-testid="goals-page">
      <Navigation />
      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; 003 &middot; Goals</div>
              <h1 className="display text-[44px] lg:text-[64px]">
                Plan your <em>future</em>
              </h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-6 max-w-2xl">
                Every financial goal deserves a dedicated plan. Whether it&rsquo;s retirement, education, 
                a home, or wealth creation — we help you map every rupee to a purpose.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-3 lg:col-start-10 flex items-end">
              <Link href="/contact" className="btn-obsidian">Book Consultation</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line mb-12">
            {goalsList.map((goal, i) => (
              <div key={goal.title} className="bg-bone p-6 lg:p-8 flex flex-col" data-testid={`goal-card-${i}`}>
                <div className="w-12 h-12 border border-obsidian flex items-center justify-center mb-5">
                  <goal.icon size={22} />
                </div>
                <div className="font-serif text-[22px] leading-tight mb-3">{goal.title}</div>
                <p className="text-[13px] text-ash leading-relaxed mb-5 flex-1">{goal.description}</p>
                <ul className="space-y-2 mb-6">
                  {goal.items.map((item) => (
                    <li key={item} className="text-[12px] text-ash font-mono flex items-center gap-2">
                      <span className="w-1 h-1 bg-antique rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={goal.href} className="group inline-flex items-center gap-2 text-[13px] font-medium hover:text-antique-dark transition-colors">
                  Explore {goal.title} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>

          <div className="border border-obsidian bg-bone p-8 lg:p-10">
            <div className="grid grid-cols-12 gap-6 items-center">
              <div className="col-span-12 lg:col-span-7">
                <div className="label-mono text-ash mb-3">Free Consultation</div>
                <h2 className="font-serif text-[28px] lg:text-[36px] leading-tight mb-3">
                  Not sure where to start?
                </h2>
                <p className="text-[14px] text-ash leading-relaxed max-w-lg">
                  Book a complimentary 30-minute session with a SEBI-registered advisor. 
                  We&rsquo;ll help you prioritise your goals and build a plan that works.
                </p>
              </div>
              <div className="col-span-12 lg:col-span-4 lg:col-start-9">
                <Link href="/contact" className="btn-obsidian w-full justify-center">
                  Book Free Session <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}