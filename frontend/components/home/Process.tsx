'use client';

import { motion } from 'framer-motion';
import SectionContainer from '@/components/shared/SectionContainer';

const steps = [
  { n: '01', t: 'Onboard Clients', d: 'Capture client goals, KYC, risk profile, and mandates in structured advisor workflows.' },
  { n: '02', t: 'Assign Portfolios', d: 'Review client holdings, asset allocation, and risk exposure in one advisor dashboard.' },
  { n: '03', t: 'Run Reviews', d: 'Schedule and execute quarterly reviews with templated reports and client communication.' },
  { n: '04', t: 'Share Documents', d: 'Upload and share KYC, agreements, and statements with audited access logs.' },
  { n: '05', t: 'Monitor Drift', d: 'Track portfolio drift, rebalancing needs, and goal progress across client segments.' },
  { n: '06', t: 'Optimize Outcomes', d: 'Use compliance-ready workflows and advisor coordination to improve client outcomes.' },
];

export default function Process() {
  return (
    <section className="hairline-b bg-bone" data-testid="process-section">
      <SectionContainer className="py-16 lg:py-24">
        <div className="grid grid-cols-12 gap-6 mb-14">
          <div className="col-span-12 lg:col-span-5">
            <div className="label-mono text-ash mb-3">— 005 · Method</div>
            <h2 className="display text-[44px] lg:text-[64px]">
              Six steps.<br/>One <em>journey</em>.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex items-end">
          <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6]">
              We don’t sell products. We give advisors the infrastructure to onboard, review, and grow client portfolios without operational chaos.
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
      </SectionContainer>
    </section>
  );
}