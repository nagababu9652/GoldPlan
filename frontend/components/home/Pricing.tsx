'use client';

import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$299',
    period: '/ month',
    desc: 'For analysts and family offices testing the practice.',
    features: ['Up to 5 portfolio briefs', 'Monthly reports', 'Email support', 'Baseline risk console', 'Daily market wire'],
    featured: false,
  },
  {
    name: 'Professional',
    price: '$999',
    period: '/ month',
    desc: 'For investment teams that read us every morning.',
    features: ['Unlimited briefs', 'Weekly reports', 'Priority editorial line', 'Advanced risk modelling', 'Live console & alerts', 'Custom dashboards', 'API access', 'White-label option'],
    featured: true,
  },
  {
    name: 'Institutional',
    price: 'Bespoke',
    period: 'on enquiry',
    desc: 'For treasuries, allocators and committees that need bespoke coverage.',
    features: ['Everything in Professional', 'Named senior editor', 'Custom model calibration', 'Bespoke compliance packs', 'Onboarding & training', 'SLA & data residency', 'Quarterly review'],
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="hairline-b" data-testid="pricing-section">
      <div className="px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid grid-cols-12 gap-6 mb-14">
          <div className="col-span-12 lg:col-span-5">
            <div className="label-mono text-ash mb-3">— 007 · Subscription</div>
            <h2 className="display text-[44px] lg:text-[64px]">
              Three tiers.<br/>One <em>standard</em>.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex items-end">
            <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6]">
              Annual mandates. Cancel by quarter notice. Pricing reflects research access,
              not seat licences — every member of your team is covered.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-line border border-line">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className={`relative p-8 lg:p-10 flex flex-col ${p.featured ? 'bg-obsidian text-bone' : 'bg-bone'}`}
              data-testid={`pricing-${p.name.toLowerCase()}`}
            >
              {p.featured && (
                <div className="absolute -top-3 left-8 px-3 py-1 bg-antique text-obsidian font-mono text-[10px] uppercase tracking-wider2">
                  Most chosen
                </div>
              )}

              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-serif text-[34px] tracking-tight">{p.name}</h3>
                <span className={`label-mono ${p.featured ? 'text-bone/50' : 'text-ash'}`}>0{i + 1}</span>
              </div>
              <p className={`text-[14px] mb-8 ${p.featured ? 'text-bone/60' : 'text-ash'}`}>{p.desc}</p>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-serif text-[64px] leading-none tracking-tight">{p.price}</span>
              </div>
              <div className={`label-mono ${p.featured ? 'text-antique' : 'text-ash'} mb-8 pb-8 border-b ${p.featured ? 'border-bone/15' : 'border-line'}`}>
                {p.period}
              </div>

              <ul className="space-y-3 mb-10 flex-1">
                {p.features.map((f) => (
                  <li key={f} className={`flex items-start gap-3 text-[14px] ${p.featured ? 'text-bone/85' : 'text-obsidian'}`}>
                    <Check size={16} className={p.featured ? 'text-antique mt-0.5' : 'text-antique-dark mt-0.5'} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`inline-flex items-center justify-between px-5 py-3.5 text-[13px] font-medium border transition-colors ${
                  p.featured
                    ? 'bg-antique text-obsidian border-antique hover:bg-bone hover:border-bone'
                    : 'border-obsidian text-obsidian hover:bg-obsidian hover:text-bone'
                }`}
                data-testid={`pricing-cta-${p.name.toLowerCase()}`}
              >
                {p.price === 'Bespoke' ? 'Speak to sales' : 'Start mandate'}
                <ArrowRight size={14} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
