'use client';

import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, PiggyBank, Shield, Target, GraduationCap, Home, Heart, ArrowUpRight,
} from 'lucide-react';

const services = [
  { icon: PiggyBank, title: 'Mutual Fund Planning', desc: 'SIP and lump-sum investment strategies across equity, debt, and hybrid funds.', tag: 'Popular', href: '/investments/mutual-funds' },
  { icon: GraduationCap, title: 'Education Planning',    desc: 'Plan for your child&rsquo;s higher education with inflation-adjusted goal tracking.',     tag: 'Goals', href: '/goals/education' },
  { icon: Home, title: 'Home Loan Advisory', desc: 'Compare lenders, maximise deductions under Section 24, and plan your EMI strategy.',     tag: 'Loan', href: '/goals/home' },
  { icon: Heart, title: 'Retirement Planning',  desc: 'NPS, EPF, PPF and mutual fund strategies for a corpus that lasts 30+ years.',         tag: 'Essential', href: '/goals/retirement' },
  { icon: Shield, title: 'Insurance Advisory',      desc: 'Term life, health insurance and critical illness cover tailored to your family&rsquo;s needs.',     tag: 'Cover', href: '/protection/term-life' },
  { icon: TrendingUp, title: 'Tax Saving (80C/80D)', desc: 'Maximise deductions across ELSS, PPF, NSC, tax-saving FDs, and health insurance.',      tag: 'Seasonal', href: '/protection/tax-saving' },
  { icon: BarChart3, title: 'Fixed Deposits & Bonds',   desc: 'Compare FD rates, corporate bonds, and debt instruments for stable returns.',        tag: 'Stable', href: '/investments/fixed-deposits' },
  { icon: Target, title: 'Wealth Management',          desc: 'Portfolio rebalancing, goal-based asset allocation, and expert-reviewed strategies.',     tag: 'Premium', href: '/goals/wealth' },
];

export default function Services() {
  return (
    <section id="solutions" className="hairline-b" data-testid="services-section">
      <div className="px-6 lg:px-10 py-16 lg:py-20 grid grid-cols-12 gap-6 hairline-b">
        <div className="col-span-12 lg:col-span-4">
          <div className="label-mono text-ash mb-3">&mdash; 002 &middot; Services</div>
          <h2 className="display text-[44px] lg:text-[64px]">
            Eight ways.<br/>One <em>purpose</em>.
          </h2>
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex items-end">
          <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6]">
            Every service is designed around your life goals, not products. Our experts analyse
            your situation and recommend strategies that align with your dreams and risk appetite.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.a
              key={s.title}
              href={s.href}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
              className={`group relative bg-bone p-8 lg:p-10 hairline-r hairline-b last:hairline-r-0 hover:bg-bone-deep transition-colors ${
                i >= 4 ? 'lg:hairline-b-0' : ''
              }`}
              data-testid={`service-card-${i}`}
            >
              <div className="flex items-start justify-between mb-10">
                <div className="w-12 h-12 border border-obsidian flex items-center justify-center group-hover:bg-obsidian group-hover:text-bone transition-colors">
                  <Icon size={20} />
                </div>
                <span className="label-mono text-ash">{s.tag}</span>
              </div>

              <h3 className="font-serif text-[26px] leading-tight mb-3 tracking-tight">
                {s.title}
              </h3>
              <p className="text-[14px] text-ash leading-relaxed mb-8">{s.desc}</p>

              <span className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider2 border-b border-obsidian pb-1 group-hover:text-antique-dark group-hover:border-antique-dark transition-colors">
                Learn more <ArrowUpRight size={12} />
              </span>

              <span className="absolute top-3 right-4 font-mono text-[10px] text-ash">
                0{i + 1}
              </span>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}
