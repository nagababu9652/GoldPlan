'use client';

import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { BarChart3, PiggyBank, Shield, TrendingUp, LineChart, Calculator, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const categories = [
  {
    title: 'Mutual Funds',
    description: 'Equity, hybrid, debt and index funds from 40+ AMCs. Expert-curated portfolios for every goal.',
    href: '/investments/mutual-funds',
    icon: BarChart3,
    items: ['Equity Funds', 'Debt Funds', 'Hybrid Funds', 'Index Funds', 'ELSS Tax Savers'],
  },
  {
    title: 'Fixed Deposits',
    description: 'Compare FD rates, corporate deposits and RBI bonds. Safe returns with flexible tenures.',
    href: '/investments/fixed-deposits',
    icon: PiggyBank,
    items: ['Bank FDs', 'Corporate FDs', 'RBI Bonds', 'Tax-Saver FDs', 'Senior Citizen Plans'],
  },
  {
    title: 'PPF / EPF / NPS',
    description: 'Tax-free, guaranteed-return government-backed instruments. Build your retirement corpus.',
    href: '/investments/ppf-epf-nps',
    icon: Shield,
    items: ['PPF Calculator', 'EPF Withdrawal', 'NPS Tier I & II', 'Tax Benefits', 'Interest Rates'],
  },
  {
    title: 'Stocks & ETFs',
    description: 'Direct equity and exchange-traded funds for active investors. Research-backed picks.',
    href: '/investments/stocks-etfs',
    icon: TrendingUp,
    items: ['Large Cap', 'Mid Cap', 'Small Cap', 'Sectoral Funds', 'International ETFs'],
  },
  {
    title: 'Gold & Commodities',
    description: 'Sovereign Gold Bonds, Gold ETFs, and commodity exposure for portfolio diversification.',
    href: '/investments/gold',
    icon: LineChart,
    items: ['SGB Calculator', 'Gold ETFs', 'Digital Gold', 'Silver', 'Commodity Funds'],
  },
  {
    title: 'Tax Saving',
    description: 'ELSS, PPF, NSC, FDs and health insurance — maximise every rupee under 80C/80D.',
    href: '/investments/tax-saving',
    icon: Calculator,
    items: ['80C Strategies', '80D Health', 'HRA Exemption', 'Capital Gains', 'NPS Additional'],
  },
];

export default function InvestmentsPage() {
  return (
    <main className="min-h-screen bg-bone text-obsidian" data-testid="investments-page">
      <Navigation />
      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; 004 &middot; Investments</div>
              <h1 className="display text-[44px] lg:text-[64px]">
                Invest with <em>purpose</em>
              </h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-6 max-w-2xl">
                From mutual funds to fixed deposits, explore every investment avenue. 
                We help you build a diversified portfolio aligned with your goals and risk appetite.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-3 lg:col-start-10 flex items-end">
              <Link href="/contact" className="btn-obsidian">Get Portfolio Review</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line mb-12">
            {categories.map((cat, i) => (
              <div key={cat.title} className="bg-bone p-6 lg:p-8 flex flex-col" data-testid={`invest-card-${i}`}>
                <div className="w-12 h-12 border border-obsidian flex items-center justify-center mb-5">
                  <cat.icon size={22} />
                </div>
                <div className="font-serif text-[22px] leading-tight mb-3">{cat.title}</div>
                <p className="text-[13px] text-ash leading-relaxed mb-5 flex-1">{cat.description}</p>
                <ul className="space-y-2 mb-6">
                  {cat.items.map((item) => (
                    <li key={item} className="text-[12px] text-ash font-mono flex items-center gap-2">
                      <span className="w-1 h-1 bg-antique rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={cat.href} className="group inline-flex items-center gap-2 text-[13px] font-medium hover:text-antique-dark transition-colors">
                  Explore {cat.title} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>

          <div className="border border-obsidian bg-bone p-8 lg:p-10">
            <div className="grid grid-cols-12 gap-6 items-center">
              <div className="col-span-12 lg:col-span-7">
                <div className="label-mono text-ash mb-3">Portfolio Review</div>
                <h2 className="font-serif text-[28px] lg:text-[36px] leading-tight mb-3">
                  Get a free portfolio health check
                </h2>
                <p className="text-[14px] text-ash leading-relaxed max-w-lg">
                  Upload or connect your existing holdings. Our advisors will review your asset allocation, 
                  suggest rebalancing, and identify tax-saving opportunities.
                </p>
              </div>
              <div className="col-span-12 lg:col-span-4 lg:col-start-9">
                <Link href="/contact" className="btn-obsidian w-full justify-center">
                  Start Review <ArrowRight size={14} />
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