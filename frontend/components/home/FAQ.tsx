'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import SectionContainer from '@/components/shared/SectionContainer';

const faqs = [
  { q: 'Who can create a client login?', a: 'Only an advisor can create client accounts from their dashboard. Clients receive credentials from their advisor.' },
  { q: 'Can advisors track existing client holdings?', a: 'Yes. Advisors can consolidate client portfolios across asset classes for unified oversight and review.' },
  { q: 'How are advisors and clients kept separate?', a: 'Role-based access ensures advisors manage their clients only, with strict data separation and audit trails.' },
  { q: 'Are advisors SEBI-registered?', a: 'Yes. Every advisor using the platform is expected to be SEBI-registered with verifiable credentials.' },
  { q: 'What happens during market volatility?', a: 'Built-in review workflows and portfolio drift alerts help advisors act before volatility impacts client goals.' },
  { q: 'How do clients access reports?', a: 'Clients can log in to view advisor-prepared reports, documents, and portfolio summaries shared with them.' },
  { q: 'Is onboarding support available?', a: 'Yes. Advisors get onboarding support to set up workflows, import clients, and run their first review cycle.' },
  { q: 'How do I request a demo?', a: 'Use the Request Demo option or contact our team. We will walk you through the advisor workflow and setup.' },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="hairline-b bg-bone-deep" data-testid="faq-section">
      <SectionContainer className="py-16 lg:py-24 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
          <div className="label-mono text-ash mb-3">— 008 · Enquiries</div>
          <h2 className="display text-[44px] lg:text-[60px]">
            Questions,<br/>candidly <em>answered</em>.
          </h2>
          <p className="text-ash text-[15px] leading-[1.6] mt-6 max-w-sm">
            Couldn\u2019t find what you were looking for? Our advisor team is available Mon\u2013Sat,
            09:00\u201319:00 IST.
          </p>
          <a href="/contact" className="inline-block mt-6 u-link text-[14px] font-medium">
            Email our advisors \u2192
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
      </SectionContainer>
    </section>
  );
}