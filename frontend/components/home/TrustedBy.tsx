'use client';

import { motion } from 'framer-motion';
import SectionContainer from '@/components/shared/SectionContainer';

const companies = [
  'SBI Mutual Fund',
  'HDFC Bank',
  'ICICI Prudential',
  'Kotak Mahindra',
  'Axis Bank',
  'Bajaj Finserv',
  'LIC of India',
  'Tata Capital',
];

export default function TrustedBy() {
  return (
    <section className="hairline-b" data-testid="trusted-section">
      <SectionContainer className="py-16 lg:py-24 grid grid-cols-12 gap-6 items-center">
        <div className="col-span-12 lg:col-span-3">
          <div className="label-mono text-ash mb-2">&mdash; 001</div>
          <h3 className="font-serif text-[26px] leading-tight">
            Trusted by India&rsquo;s <em className="text-antique-dark">leading</em> institutions.
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
      </SectionContainer>
    </section>
  );
}