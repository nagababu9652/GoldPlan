'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import SectionContainer from '@/components/shared/SectionContainer';

const testimonials = [
  {
    name: 'Rajesh Sharma',
    role: 'Chief Financial Officer',
    company: 'Bharat Industries Ltd.',
    text: 'FinPlan India transformed how our family saves and invests. The goal-based approach made us realise we were under-insured and over-invested in the wrong funds. Now we have a clear roadmap for retirement and our kids\u2019 education.',
    initials: 'RS',
  },
  {
    name: 'Priya Patel',
    role: 'Senior Manager, IT',
    company: 'Tech Solutions Pune',
    text: 'I had been investing in random mutual funds without any strategy. FinPlan consolidated everything, showed me the tax savings I was missing, and set up a proper SIP plan. My portfolio grew 18% in the first year itself.',
    initials: 'PP',
  },
  {
    name: 'Amit Verma',
    role: 'Business Owner',
    company: 'Verma & Sons Enterprises',
    text: 'The NPS and PPF optimisation alone saved us over \u20B91.2 lakh in taxes annually. The dashboard is incredibly intuitive \u2014 I can see all my goals and progress in one place. Worth every rupee.',
    initials: 'AV',
  },
];

export default function Testimonials() {
  return (
    <section className="hairline-b bg-obsidian text-bone" data-testid="testimonials-section">
      <SectionContainer className="py-16 lg:py-24">
        <div className="grid grid-cols-12 gap-6 mb-14">
          <div className="col-span-12 lg:col-span-5">
            <div className="label-mono text-bone/50 mb-3">— 006 · Letters</div>
            <h2 className="display text-[44px] lg:text-[64px] text-bone">
              From the<br/><em className="text-antique">desk</em> of our clients.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8 flex items-end">
            <p className="text-bone/60 text-[16px] lg:text-[18px] leading-[1.6]">
              Real stories from families and professionals who transformed their financial future
              with FinPlan India.
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
      </SectionContainer>
    </section>
  );
}