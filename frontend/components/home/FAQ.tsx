'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  { q: 'How accurate are the gold-price forecasts?',         a: 'Our ensemble models achieve 94%+ directional accuracy on 30-day horizons, calibrated against three decades of LBMA and COMEX data. We publish back-tested error bands with every brief.' },
  { q: 'What data security measures are in place?',          a: 'AES-256 encryption at rest, TLS 1.3 in transit, SOC 2 Type II audited, ISO 27001 in progress. EU and US data-residency options available on Institutional tier.' },
  { q: 'Can I integrate GoldPlan with existing systems?',    a: 'Yes. We expose a REST API, webhook events, FIX bridge and CSV exports. Common integrations include BlackRock Aladdin, Bloomberg AIM, and FactSet Portfolio.' },
  { q: 'How long does it take to generate a report?',        a: 'Quarterly briefs ship on schedule. Bespoke reports clear in 24–72 hours, depending on scope. The live console is available continuously.' },
  { q: 'Do you offer training for our team?',                a: 'Institutional mandates include a 4-week onboarding programme, a named senior editor and quarterly desk visits — virtual or in person, your preference.' },
  { q: 'What is your uptime guarantee?',                     a: '99.95% on the live console, 99.99% on the data layer. Service credits apply against SLA breaches under the Institutional tier.' },
  { q: 'Which export formats do you support?',               a: 'Branded PDF, DOCX, XLSX, CSV and a versioned JSON payload via API. White-label options available from Professional upward.' },
  { q: 'Is there a free trial available?',                   a: 'A 14-day institutional trial with full console and one sample report. No card required. Speak to our team to start.' },
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
            Couldn't find what you were looking for? Our editorial line is open Mon–Fri,
            08:00–18:00 GMT.
          </p>
          <a href="#" className="inline-block mt-6 u-link text-[14px] font-medium">
            Email an editor →
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
