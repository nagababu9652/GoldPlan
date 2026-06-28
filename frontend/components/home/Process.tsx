'use client';

import { motion } from 'framer-motion';

const steps = [
  { n: '01', t: 'Set Your Goal',           d: 'Define what matters — retirement corpus, child education, dream home, or wealth building.' },
  { n: '02', t: 'Assess Risk & Timeline',            d: 'Our engine evaluates your risk appetite, time horizon, and income profile.' },
  { n: '03', t: 'Build a Strategy',             d: 'Get a personalised plan with mutual funds, PPF, NPS, FDs, and insurance mapped to each goal.' },
  { n: '04', t: 'Start Investing',  d: 'Set up SIPs, make lump-sum investments, and activate tax-saving strategies — all in one place.' },
  { n: '05', t: 'Track Progress',           d: 'Monitor goal progress, portfolio performance, and get rebalancing alerts monthly.' },
  { n: '06', t: 'Review & Optimise',          d: 'Annual reviews with expert advisors to realign your plan with life changes and market conditions.' },
];

export default function Process() {
  return (
    <section className="hairline-b bg-bone" data-testid="process-section">
      <div className="px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid grid-cols-12 gap-6 mb-16">
          <div className="col-span-12 lg:col-span-5">
            <div className="label-mono text-ash mb-3">— 005 · Method</div>
            <h2 className="display text-[44px] lg:text-[64px]">
              Six steps.<br/>One <em>journey</em>.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex items-end">
            <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6]">
              We don’t sell products. We build a financial roadmap for your life — mapped
              to your income, your dreams, and the real India you live in.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="bg-bone p-8 lg:p-10 relative group hover:bg-bone-deep transition-colors"
              data-testid={`process-step-${s.n}`}
            >
              <div className="flex items-start justify-between mb-8">
                <span className="font-serif text-[72px] leading-none text-antique-dark/30 group-hover:text-antique-dark transition-colors">
                  {s.n}
                </span>
                <span className="label-mono text-ash">step</span>
              </div>
              <h3 className="font-serif text-[28px] tracking-tight leading-tight mb-3">{s.t}</h3>
              <p className="text-[14px] text-ash leading-relaxed">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
