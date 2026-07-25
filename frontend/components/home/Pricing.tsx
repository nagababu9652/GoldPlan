'use client';

import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import SectionContainer from '@/components/shared/SectionContainer';

const plans = [
  {
    name: 'Starter',
    price: '₹499',
    period: '/ month',
    desc: 'For individuals starting their financial planning journey.',
    features: ['Up to 3 financial goals', 'Monthly portfolio review', 'Email support', 'Basic goal tracker', 'SIP calculator'],
    featured: false,
  },
  {
    name: 'Professional',
    price: '₹1,999',
    period: '/ month',
    desc: 'For families who want comprehensive planning and expert guidance.',
    features: ['Unlimited goals', 'Weekly portfolio review', 'Priority advisor access', 'Advanced risk modelling', 'Tax optimisation engine', 'Insurance gap analysis', 'Goal rebalancing alerts', 'Annual review session'],
    featured: true,
  },
  {
    name: 'Family',
    price: 'Bespoke',
    period: 'on enquiry',
    desc: 'For HNI families and businesses requiring dedicated wealth management.',
    features: ['Everything in Professional', 'Named senior advisor', 'Custom portfolio strategy', 'Bespoke tax planning', 'Family insurance audit', 'Quarterly in-person reviews', 'Estate & succession planning'],
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="hairline-b" data-testid="pricing-section">
      <SectionContainer className="py-16 lg:py-24">
        <div className="grid grid-cols-12 gap-6 mb-14">
          <div className="col-span-12 lg:col-span-5">
            <div className="label-mono text-ash mb-3">— 007 · Subscription</div>
            <h2 className="display text-[44px] lg:text-[64px]">
              Three plans.<br/>One <em>commitment</em>.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex items-end">
            <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6]">
              Annual mandates. Cancel anytime. All prices in INR. GST applicable. Every plan
              includes access to the full FinPlan India platform.
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
                href={p.price === 'Bespoke' ? '/contact' : '/login'}
                className={`inline-flex items-center justify-between px-5 py-3.5 text-[13px] font-medium border transition-colors ${
                  p.featured
                    ? 'bg-antique text-obsidian border-antique hover:bg-bone hover:border-bone'
                    : 'border-obsidian text-obsidian hover:bg-obsidian hover:text-bone'
                }`}
                data-testid={`pricing-cta-${p.name.toLowerCase()}`}
              >
                {p.price === 'Bespoke' ? 'Talk to us' : 'Start plan'}
                <ArrowRight size={14} />
              </a>
            </motion.div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}