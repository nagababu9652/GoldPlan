'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Target, GraduationCap, Home, Heart } from 'lucide-react';
import SectionContainer from '@/components/shared/SectionContainer';

export default function Hero() {
  return (
    <section className="relative pt-32 lg:pt-36" data-testid="hero-section">
      <SectionContainer className="pb-6 flex items-center justify-between border-b border-line">
        <div className="label-mono text-ash">FinPlan India &middot; Issue 01 &middot; 2026</div>
        <div className="label-mono text-ash hidden md:block">Your Financial Journey, Simplified</div>
        <div className="label-mono text-antique-dark">Goal Planning</div>
      </SectionContainer>

      <SectionContainer className="pt-16 lg:pt-24 pb-20 lg:pb-28 grid grid-cols-12 gap-x-8 gap-y-10 hairline-b">
        <div className="col-span-12 lg:col-span-3 order-1">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
            data-testid="hero-eyebrow"
          >
            <div className="label-mono text-ash">Lead &middot; Planning</div>
            <div className="text-ash text-[14px] leading-relaxed border-l border-line pl-4">
              India&rsquo;s advisor operating system &mdash; built for <span className="text-obsidian font-medium">client onboarding, portfolio oversight, and review workflows</span>. Built in Mumbai. Trusted by 500+ advisors.
            </div>
          </motion.div>
        </div>

        <div className="col-span-12 lg:col-span-9 order-2">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="display text-[44px] sm:text-[64px] lg:text-[88px] xl:text-[96px]"
            data-testid="hero-headline"
          >
            Advisory <em>operations</em>,<br/>
            scaled with <em>precision</em>.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 grid grid-cols-12 gap-6"
          >
              <p className="col-span-12 lg:col-span-7 text-[15px] lg:text-[16px] leading-[1.55] text-ash">
              Onboard clients faster, manage portfolios confidently, and run review cycles without chaos. Designed for advisory teams, not spreadsheets.
            </p>

            <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 lg:items-end">
              <div className="flex flex-wrap gap-3">
                <a href="/login" className="btn-obsidian" data-testid="hero-cta-demo">
                  Advisor Login <ArrowRight size={16} />
                </a>
                <a href="/contact" className="btn-outline" data-testid="hero-cta-report">
                  Book Demo
                </a>
              </div>
              <div className="label-mono text-ash text-[11px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full live-dot" /> Advisor-first platform
              </div>
            </div>
          </motion.div>
        </div>
      </SectionContainer>

      {/* <SectionContainer className="pb-10 hairline-b">
        <div className="label-mono text-ash mb-6">Plan for what matters most</div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-px bg-line border border-line">
          {[
            { icon: GraduationCap, label: 'Education', desc: 'Kids higher education fund', href: '/goals/education' },
            { icon: Home, label: 'Home', desc: 'Buy your dream home', href: '/goals/home' },
            { icon: Heart, label: 'Retirement', desc: 'Retire with confidence', href: '/goals/retirement' },
            { icon: Target, label: 'Wealth', desc: 'Build long-term wealth', href: '/goals/wealth' },
            { icon: TrendingUp, label: 'Tax Saving', desc: 'Optimise 80C, 80D and more', href: '/protection/tax-saving' },
          ].map((g, i) => {
            const Icon = g.icon;
            return (
              <motion.a
                key={g.label}
                href={g.href}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-bone p-6 lg:p-8 group hover:bg-bone-deep transition-colors"
                data-testid={`goal-card-${i}`}
              >
                <div className="w-10 h-10 border border-obsidian flex items-center justify-center group-hover:bg-obsidian group-hover:text-bone transition-colors mb-4">
                  <Icon size={18} />
                </div>
                <div className="font-serif text-[20px] leading-tight mb-1 group-hover:text-antique-dark transition-colors">{g.label}</div>
                <div className="text-[11px] text-ash leading-snug">{g.desc}</div>
              </motion.a>
            );
          })}
        </div>
      </SectionContainer> */}
    </section>
  );
}