'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Calculator, Target, Shield, TrendingUp, Users, FileText } from 'lucide-react';

const features = [
  { num: '01', title: 'Smart Goal Calculator',  desc: 'AI-powered calculators that factor inflation, lifestyle, and life expectancy into every goal projection.' },
  { num: '02', title: 'SIP & Lump Sum Planner',   desc: 'Optimise your monthly SIP amounts or lump-sum investments across mutual fund categories.' },
  { num: '03', title: 'Tax Optimisation Engine',   desc: 'Maximise deductions under 80C, 80D, 24(b), NPS, and more with personalised recommendations.' },
  { num: '04', title: 'Goal Tracking Dashboard', desc: 'Real-time progress tracking for every financial goal with alerts and rebalancing suggestions.' },
  { num: '05', title: 'Certified Advisors',      desc: 'SEBI-registered advisors with decades of combined experience in Indian financial markets.' },
  { num: '06', title: 'Family Insurance Review',        desc: 'Annual insurance gap analysis covering term life, health, and critical illness for your entire family.' },
];

export default function Features() {
  return (
    <section className="hairline-b bg-bone-deep" data-testid="features-section">
      <div className="px-6 lg:px-10 py-16 lg:py-24 grid grid-cols-12 gap-x-6 gap-y-12">
        <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <div className="label-mono text-ash mb-4">&mdash; 003 &middot; Why</div>
          <h2 className="display text-[44px] lg:text-[72px]">
            Built for every<br/><em>rupee</em> you earn.
          </h2>
          <p className="text-ash text-[16px] lg:text-[18px] leading-[1.65] mt-8 max-w-md">
            Not a generic dashboard. A personalised financial command centre that understands
            Indian tax laws, inflation realities, and your unique life goals.
          </p>
          <div className="mt-10 pt-8 border-t border-line">
            <div className="font-mono text-[11px] uppercase tracking-wider2 text-ash mb-2">Trusted by</div>
            <div className="font-serif text-[28px] leading-tight">50,000+ families across India</div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-px bg-line border border-line">
          {features.map((f, i) => (
            <motion.div
              key={f.num}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="bg-bone p-7 lg:p-8 group"
              data-testid={`feature-${f.num}`}
            >
              <div className="flex items-center justify-between mb-5">
                <span className="label-mono text-ash">{f.num}</span>
                <CheckCircle2 size={16} className="text-antique-dark" />
              </div>
              <h3 className="font-serif text-[24px] leading-tight tracking-tight mb-2 group-hover:text-antique-dark transition-colors">
                {f.title}
              </h3>
              <p className="text-[13.5px] text-ash leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
