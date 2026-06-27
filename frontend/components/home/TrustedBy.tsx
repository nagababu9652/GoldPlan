'use client';

import { motion } from 'framer-motion';

const companies = [
  'Goldman Sachs',
  'Morgan Stanley',
  'JPMorgan Chase',
  'BlackRock',
  'Vanguard',
  'Fidelity',
  'State Street',
  'PIMCO',
];

export default function TrustedBy() {
  return (
    <section className="px-6 lg:px-10 py-14 hairline-b" data-testid="trusted-section">
      <div className="grid grid-cols-12 gap-6 items-center">
        <div className="col-span-12 lg:col-span-3">
          <div className="label-mono text-ash mb-2">— 001</div>
          <h3 className="font-serif text-[26px] leading-tight">
            Read by the desks that <em className="text-antique-dark">move</em> markets.
          </h3>
        </div>
        <div className="col-span-12 lg:col-span-9 overflow-hidden marquee-mask">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex gap-14 items-center"
          >
            {[...companies, ...companies].map((c, i) => (
              <span key={i} className="font-serif text-[20px] lg:text-[24px] tracking-tight text-ash whitespace-nowrap hover:text-obsidian transition-colors">
                {c}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
