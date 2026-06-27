'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Chief Financial Officer',
    company: 'Wealth Advisors Inc.',
    text: 'GoldPlan AI rewrote how we underwrite precious-metal exposure. The editorial standard is the difference — every claim is sourced, every model assumption is defended.',
    initials: 'SJ',
  },
  {
    name: 'Michael Chen',
    role: 'Director, Allocations',
    company: 'Global Finance Partners',
    text: 'Their forecasting cadence improved our risk-adjusted return by 34% over four quarters. We treat their morning brief like a Bloomberg replacement, not a supplement.',
    initials: 'MC',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Chief Executive Officer',
    company: 'Investment Partners LLC',
    text: 'A research house that ships software. The dashboard is a courtesy — the real product is the people behind the analysis. Worth every basis point.',
    initials: 'ER',
  },
];

export default function Testimonials() {
  return (
    <section className="hairline-b bg-obsidian text-bone" data-testid="testimonials-section">
      <div className="px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid grid-cols-12 gap-6 mb-14">
          <div className="col-span-12 lg:col-span-5">
            <div className="label-mono text-bone/50 mb-3">— 006 · Letters</div>
            <h2 className="display text-[44px] lg:text-[64px] text-bone">
              From the<br/><em className="text-antique">desk</em> of clients.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8 flex items-end">
            <p className="text-bone/60 text-[16px] lg:text-[18px] leading-[1.6]">
              Unedited correspondence from allocators, treasurers and chief economists who
              read us every morning.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-bone/10 border border-bone/10">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="bg-obsidian p-8 lg:p-10 flex flex-col"
              data-testid={`testimonial-${i}`}
            >
              <Quote size={28} className="text-antique mb-8" />
              <blockquote className="font-serif text-[22px] lg:text-[24px] leading-[1.35] tracking-tight text-bone flex-1">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <figcaption className="mt-8 pt-6 border-t border-bone/15 flex items-center gap-4">
                <div className="w-12 h-12 border border-antique text-antique flex items-center justify-center font-serif text-[18px]">
                  {t.initials}
                </div>
                <div>
                  <div className="text-[14px] font-medium text-bone">{t.name}</div>
                  <div className="text-[12px] text-bone/55">{t.role}</div>
                  <div className="label-mono text-antique mt-0.5">{t.company}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
