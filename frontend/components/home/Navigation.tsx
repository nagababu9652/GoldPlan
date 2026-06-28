'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ChevronDown,
  LineChart, BarChart3, Shield, Target, FileText,
  BookOpen, GraduationCap, Newspaper,
  Building2, Users, Briefcase,
  Home, Heart, TrendingUp, PiggyBank, Calculator, ArrowUpRight, ArrowRight,
} from 'lucide-react';

type MegaItem = {
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

type NavItem =
  | { label: 'Goals' | 'Investments' | 'Resources' | 'Company'; columns: { heading: string; items: MegaItem[] }[]; promo?: { title: string; body: string; cta: string; href: string } }
  | { label: string; href: string };

const goalsItems: { heading: string; items: MegaItem[] }[] = [
  {
    heading: 'Life Goals',
    items: [
      { label: 'Retirement Planning', description: 'NPS, PPF, EPF and mutual funds for a stress-free retirement.', href: '#', icon: Target },
      { label: 'Child Education', description: 'Beat inflation with inflation-adjusted education fund planning.', href: '#', icon: GraduationCap },
      { label: 'Home Purchase', description: 'Plan your down payment, compare home loan options and maximise 80C/24(b).', href: '#', icon: Home },
      { label: 'Wealth Creation', description: 'Long-term SIP strategies across equity, hybrid and index funds.', href: '#', icon: TrendingUp },
    ],
  },
  {
    heading: 'Protection',
    items: [
      { label: 'Term Life Insurance', description: 'Compare and optimise term cover across top Indian insurers.', href: '#', icon: Shield },
      { label: 'Health Insurance', description: 'Family floater, critical illness and top-up plans.', href: '#', icon: Heart },
      { label: 'Tax Saving (80C/80D)', description: 'ELSS, PPF, NSC, FDs and health insurance - maximise every rupee.', href: '#', icon: FileText },
    ],
  },
];

const investmentsItems: { heading: string; items: MegaItem[] }[] = [
  {
    heading: 'By Category',
    items: [
      { label: 'Mutual Funds',     description: 'Equity, hybrid, debt and index funds from 40+ AMCs.', href: '#dashboard', icon: BarChart3 },
      { label: 'Fixed Deposits',         description: 'Compare FD rates, corporate deposits and RBI bonds.', href: '#dashboard', icon: PiggyBank },
      { label: 'PPF / EPF / NPS',         description: 'Tax-free, guaranteed-return government-backed instruments.', href: '#dashboard', icon: Shield },
    ],
  },
  {
    heading: 'Tools',
    items: [
      { label: 'SIP Calculator', description: 'Estimate returns, inflation-adjusted corpus and goal timelines.', href: '#dashboard', icon: Calculator },
      { label: 'Goal Tracker',       description: 'Real-time progress bars, rebalancing alerts and projections.', href: '#dashboard', icon: Target },
      { label: 'Portfolio Review',  description: 'Upload or connect your existing holdings for a free review.', href: '#dashboard', icon: LineChart },
    ],
  },
];

const resourcesItems: { heading: string; items: MegaItem[] }[] = [
  {
    heading: 'Learn',
    items: [
      { label: 'Field Notes',     description: 'Weekly editorial on gold markets.', href: '#', icon: Newspaper },
      { label: 'Documentation',   description: 'APIs, SDKs, schemas.',              href: '#', icon: BookOpen },
      { label: 'Academy',         description: 'Courses for analysts.',             href: '#', icon: GraduationCap },
    ],
  },
];

const companyItems: { heading: string; items: MegaItem[] }[] = [
  {
    heading: 'About',
    items: [
      { label: 'Our Firm',  description: 'A research house, not a SaaS.', href: '#', icon: Building2 },
      { label: 'Clients',   description: 'Allocators, family offices, treasuries.', href: '#', icon: Users },
      { label: 'Careers',   description: 'Join our editorial team.', href: '#', icon: Briefcase },
    ],
  },
];

const navItems: NavItem[] = [
  { label: 'Goals', columns: goalsItems, promo: { title: 'Free Consultation', body: 'One complimentary 30-minute session with a SEBI-registered advisor.', cta: 'Book now', href: '#' } },
  { label: 'Investments',  columns: investmentsItems,  promo: { title: 'SIP Calculator', body: 'Calculate your retirement, education or goal corpus in 60 seconds.', cta: 'Try it free', href: '#' } },
  { label: 'Pricing',  href: '#pricing' },
  { label: 'Resources', columns: resourcesItems },
  { label: 'Company',  columns: companyItems },
];

export default function Navigation() {
  const [openMega, setOpenMega] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-bone/85 backdrop-blur-xl border-b border-line' : 'bg-bone/60 backdrop-blur-md border-b border-line/60'
      }`}
      data-testid="primary-navigation"
      onMouseLeave={() => setOpenMega(null)}
    >
      {/* Top utility bar */}
      <div className="hidden lg:flex items-center justify-between border-b border-line/70 px-8 py-1.5 text-[11px] font-mono uppercase tracking-wider2 text-ash">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full live-dot" />
            <span>Markets — Open</span>
          </span>
          <span>Mumbai 19:02 IST</span>
        </div>
        <div className="flex items-center gap-6">
          <span>NIFTY 50 <span className="text-obsidian">24,891</span> <span className="text-emerald-700">+1.2%</span></span>
          <span>SENSEX <span className="text-obsidian">81,456</span> <span className="text-emerald-700">+1.1%</span></span>
          <a href="/login" className="u-link text-obsidian">Client login →</a>
        </div>
      </div>

      {/* Main bar */}
      <div className="flex items-center justify-between px-6 lg:px-8 h-16">
        {/* Brand */}
        <a href="#" className="flex items-center gap-3 shrink-0" data-testid="brand-logo">
          <div className="w-8 h-8 bg-obsidian text-bone flex items-center justify-center">
            <span className="font-serif text-[18px] leading-none">F</span>
          </div>
          <div className="leading-none">
            <div className="font-serif text-[20px] tracking-tight">FinPlan<span className="text-antique">.</span></div>
            <div className="font-mono text-[9px] uppercase tracking-wider2 text-ash mt-0.5">EST. 2024 · MUMBAI</div>
          </div>
        </a>

        {/* Center nav */}
        <nav className="hidden lg:flex items-center h-full" data-testid="nav-links">
          {navItems.map((item) => {
            if ('href' in item) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="h-full px-5 flex items-center text-[13px] font-medium text-obsidian hover:text-antique-dark transition-colors"
                  data-testid={`nav-link-${item.label.toLowerCase()}`}
                  onMouseEnter={() => setOpenMega(null)}
                >
                  {item.label}
                </a>
              );
            }
            const isOpen = openMega === item.label;
            return (
              <button
                key={item.label}
                onMouseEnter={() => setOpenMega(item.label)}
                onClick={() => setOpenMega(isOpen ? null : item.label)}
                className={`h-full px-5 flex items-center gap-1 text-[13px] font-medium transition-colors ${
                  isOpen ? 'text-antique-dark' : 'text-obsidian hover:text-antique-dark'
                }`}
                data-testid={`nav-trigger-${item.label.toLowerCase()}`}
              >
                {item.label}
                <ChevronDown size={13} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="hidden lg:flex items-center gap-3">
          <a href="/login" className="btn-outline text-[13px] font-medium text-obsidian" data-testid="nav-signin">Sign in</a>
          <a
            href="#"
            className="btn-obsidian text-[13px] py-2.5 px-4"
            data-testid="nav-cta-demo"
          >
            Request Demo <ArrowRight size={14} />
          </a>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden w-10 h-10 border border-obsidian flex items-center justify-center"
          aria-label="Toggle menu"
          data-testid="mobile-menu-toggle"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* MEGA MENU */}
      <AnimatePresence>
        {openMega && navItems.find((i) => i.label === openMega && !('href' in i)) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setOpenMega(openMega)}
            className="hidden lg:block absolute left-0 right-0 top-full bg-bone border-t border-b border-line shadow-[0_24px_40px_-24px_rgba(12,11,10,0.18)]"
            data-testid={`mega-menu-${openMega.toLowerCase()}`}
          >
            <div className="max-w-[1440px] mx-auto px-8 py-10 grid grid-cols-12 gap-10">
              {(() => {
                const current = navItems.find((i) => i.label === openMega) as Extract<NavItem, { columns: any }>;
                const cols = current.columns;
                return (
                  <>
                    <div className="col-span-2">
                      <div className="label-mono text-ash mb-3">{openMega}</div>
                      <h3 className="font-serif text-3xl leading-tight">
                        Tools for the<br/><em className="text-antique-dark">long allocator</em>.
                      </h3>
                    </div>
                    {cols.map((col) => (
                      <div key={col.heading} className="col-span-3">
                        <div className="label-mono text-ash mb-5 pb-3 border-b border-line">{col.heading}</div>
                        <ul className="space-y-5">
                          {col.items.map((it) => (
                            <li key={it.label}>
                              <a href={it.href} className="group flex gap-3 items-start" data-testid={`mega-link-${it.label.toLowerCase().replace(/\s+/g,'-')}`}>
                                <span className="mt-0.5 w-9 h-9 border border-line flex items-center justify-center group-hover:bg-obsidian group-hover:text-bone group-hover:border-obsidian transition-colors">
                                  <it.icon size={16} />
                                </span>
                                <span className="flex-1">
                                  <span className="block text-[14px] font-medium text-obsidian group-hover:text-antique-dark transition-colors flex items-center gap-1">
                                    {it.label}
                                    <ArrowUpRight size={12} className="opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                                  </span>
                                  <span className="block text-[12.5px] text-ash leading-snug mt-0.5">{it.description}</span>
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {current.promo && (
                      <div className="col-span-4 bg-obsidian text-bone p-6 flex flex-col justify-between">
                        <div>
                          <div className="label-mono text-bone/60 mb-4">Featured</div>
                          <h4 className="font-serif text-2xl leading-tight mb-3">{current.promo.title}</h4>
                          <p className="text-bone/75 text-[13px] leading-relaxed">{current.promo.body}</p>
                        </div>
                        <a href={current.promo.href} className="mt-6 inline-flex items-center justify-between border border-bone/30 px-4 py-3 text-[12px] font-mono uppercase tracking-wider2 hover:bg-bone hover:text-obsidian transition-colors">
                          {current.promo.cta} <ArrowRight size={14} />
                        </a>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-bone border-t border-line overflow-hidden"
            data-testid="mobile-drawer"
          >
            <div className="px-6 py-6 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={'href' in item ? item.href : '#'}
                  onClick={closeMobile}
                  className="flex items-center justify-between py-3 border-b border-line text-[15px] font-medium text-obsidian"
                  data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                  <ArrowUpRight size={16} className="text-ash" />
                </a>
              ))}
              <div className="pt-5 flex flex-col gap-3">
                <a href="/login" onClick={closeMobile} className="btn-outline justify-center">Sign in</a>
                <a href="#" onClick={closeMobile} className="btn-obsidian justify-center">Request Demo <ArrowRight size={14} /></a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
