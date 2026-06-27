'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const features = [
  { num: '01', title: 'AI Powered Analytics',  desc: 'Machine-learning ensembles trained on 30+ years of metals & macro data.' },
  { num: '02', title: '99.9% Data Accuracy',   desc: 'Six independent vendor feeds, reconciled tick-by-tick by our pipeline.' },
  { num: '03', title: 'Enterprise Security',   desc: 'AES-256 at rest, SOC 2 Type II, EU/US data residency on request.' },
  { num: '04', title: 'Real-time Gold Prices', desc: 'Sub-second updates from LBMA, COMEX, Shanghai and OTC desks.' },
  { num: '05', title: 'Industry Experts',      desc: '14 named editors. 220 years of cumulative buy-side experience.' },
  { num: '06', title: 'Custom Reports',        desc: 'White-label PDFs, board memos and API-ready JSON — your brand, our rigour.' },
];

export default function Features() {
  return (
    <section className="hairline-b bg-bone-deep" data-testid="features-section">
      <div className="px-6 lg:px-10 py-16 lg:py-24 grid grid-cols-12 gap-x-6 gap-y-12">
        <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <div className="label-mono text-ash mb-4">— 003 · Why</div>
          <h2 className="display text-[44px] lg:text-[72px]">
            A house built for<br/><em>conviction</em>.
          </h2>
          <p className="text-ash text-[16px] lg:text-[18px] leading-[1.65] mt-8 max-w-md">
            Not a feed. Not a dashboard. A research practice with editorial standards,
            engineered for institutions that need defensible output.
          </p>
          <div className="mt-10 pt-8 border-t border-line">
            <div className="font-mono text-[11px] uppercase tracking-wider2 text-ash mb-2">Independent Audit</div>
            <div className="font-serif text-[28px] leading-tight">PwC verified · Q3 2025</div>
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
