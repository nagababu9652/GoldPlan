'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Target, GraduationCap, Home, Heart } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 lg:pt-36 pb-0" data-testid="hero-section">
      <div className="px-6 lg:px-10 pb-6 flex items-center justify-between border-b border-line">
        <div className="label-mono text-ash">FinPlan India &middot; Issue 01 &middot; 2026</div>
        <div className="label-mono text-ash hidden md:block">Your Financial Journey, Simplified</div>
        <div className="label-mono text-antique-dark">Goal Planning</div>
      </div>

      <div className="px-6 lg:px-10 pt-12 lg:pt-20 pb-16 lg:pb-24 grid grid-cols-12 gap-x-6 gap-y-10">
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
              India&rsquo;s most trusted financial planning platform &mdash; helping families plan for <span className="text-obsidian">retirement, education, home, and beyond</span>. Built in Mumbai. Trusted by 50,000+ families.
            </div>
          </motion.div>
        </div>

        <div className="col-span-12 lg:col-span-9 order-2">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="display text-[56px] sm:text-[80px] lg:text-[112px] xl:text-[128px]"
            data-testid="hero-headline"
          >
            Your <em>financial</em> goals,<br/>
            planned with <em>precision</em>.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 grid grid-cols-12 gap-6"
          >
            <p className="col-span-12 lg:col-span-7 text-[17px] lg:text-[19px] leading-[1.55] text-ash">
              FinPlan India is a comprehensive financial planning platform. From mutual funds and
              tax saving to retirement planning and insurance &mdash; we help you map every rupee to a goal,
              powered by smart algorithms, guided by expert advisors.
            </p>

            <div className="col-span-12 lg:col-span-5 flex flex-col gap-3 lg:items-end">
              <div className="flex flex-wrap gap-3">
                <a href="#" className="btn-obsidian" data-testid="hero-cta-demo">
                  Start Planning <ArrowRight size={16} />
                </a>
                <a href="#" className="btn-outline" data-testid="hero-cta-report">
                  Talk to an Advisor
                </a>
              </div>
              <div className="label-mono text-ash text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full live-dot" /> Free consultation available
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-6 lg:px-10 pb-8 hairline-b">
        <div className="label-mono text-ash mb-6">Plan for what matters most</div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-px bg-line border border-line">
          {[
            { icon: GraduationCap, label: 'Education', desc: 'Kids higher education fund' },
            { icon: Home, label: 'Home', desc: 'Buy your dream home' },
            { icon: Heart, label: 'Retirement', desc: 'Retire with confidence' },
            { icon: Target, label: 'Wealth', desc: 'Build long-term wealth' },
            { icon: TrendingUp, label: 'Tax Saving', desc: 'Optimise 80C, 80D and more' },
          ].map((g, i) => {
            const Icon = g.icon;
            return (
              <motion.a
                key={g.label}
                href="#"
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
                <div className="text-[12.5px] text-ash leading-snug">{g.desc}</div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
