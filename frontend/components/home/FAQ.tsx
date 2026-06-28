'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  { q: 'What is the minimum amount needed to start investing?',         a: 'You can start with as little as ₹500 per month through SIPs in mutual funds. Our platform helps you begin your journey with whatever budget you have.' },
  { q: 'How is FinPlan India different from a regular mutual fund platform?',          a: 'Unlike generic investment platforms, FinPlan India is goal-based. We don’t just help you invest — we help you plan for specific goals like retirement, education, and home buying with personalised strategies.' },
  { q: 'Can I track my existing investments on the platform?',    a: 'Yes. You can import your existing mutual fund holdings, PPF, EPF, NPS, FDs, and insurance policies. Our engine consolidates everything into one unified view.' },
  { q: 'How does the tax-saving feature work?',        a: 'Our tax engine analyses your income profile and suggests optimal investments under Section 80C, 80D, 24(b), NPS (80CCD), and other applicable sections to minimise your tax outgo legally.' },
  { q: 'Are your advisors SEBI-registered?',                a: 'Yes. Every advisor on our platform is SEBI-registered with verifiable credentials. You can view their registration number and track record on their profile.' },
  { q: 'What happens if the market goes down?',                     a: 'Our goal-based framework builds in market volatility buffers. We use asset allocation and rebalancing strategies to protect your long-term goals from short-term market fluctuations.' },
  { q: 'Can I involve my family members in planning?',               a: 'Absolutely. Our Family plan allows you to add spouse, children, and parents to create a unified family financial plan with shared goals and consolidated tracking.' },
  { q: 'Is there a free trial available?',                   a: 'Yes. We offer a 14-day free trial with full platform access and one complimentary session with an advisor. No credit card required.' },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="hairline-b bg-bone-deep" data-testid="faq-section">
      <div className="px-6 lg:px-10 py-16 lg:py-24 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
          <div className="label-mono text-ash mb-3">— 008 · Enquiries</div>
          <h2 className="display text-[44px] lg:text-[60px]">
            Questions,<br/>candidly <em>answered</em>.
          </h2>
          <p className="text-ash text-[15px] leading-[1.6] mt-6 max-w-sm">
            Couldn’t find what you were looking for? Our advisor team is available Mon–Sat,
            09:00–19:00 IST.
          </p>
          <a href="#" className="inline-block mt-6 u-link text-[14px] font-medium">
            Email our advisors →
          </a>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="border-t border-line">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={i} className="border-b border-line" data-testid={`faq-${i}`}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full py-6 lg:py-7 flex items-center justify-between gap-8 text-left group"
                  >
                    <div className="flex items-baseline gap-5 flex-1">
                      <span className="label-mono text-ash shrink-0">0{i + 1}</span>
                      <h3 className="font-serif text-[22px] lg:text-[26px] leading-tight tracking-tight group-hover:text-antique-dark transition-colors">
                        {f.q}
                      </h3>
                    </div>
                    <span className="w-10 h-10 border border-obsidian flex items-center justify-center shrink-0 group-hover:bg-obsidian group-hover:text-bone transition-colors">
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pl-12 pr-14 pb-7 text-[15px] leading-[1.65] text-ash">
                          {f.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
