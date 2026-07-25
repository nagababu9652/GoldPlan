'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Calculator, Target, Shield, TrendingUp, Users, FileText } from 'lucide-react';
import SectionContainer from '@/components/shared/SectionContainer';

const features = [
  { num: '01', title: 'Client Onboarding', desc: 'Structured intake flows to capture client goals, KYC, risk profile, and mandates without back-and-forth emails.' },
  { num: '02', title: 'Portfolio Oversight', desc: 'Unified view of client holdings, allocations, drift, and action items across asset classes.' },
  { num: '03', title: 'Review Workflows', desc: 'Quarterly review templates, report generation, and client communication in one advisor workspace.' },
  { num: '04', title: 'Document Hub', desc: 'Centralised access to KYC, agreements, mandates, and statements with audited retrieval.' },
  { num: '05', title: 'Advisor-Only Access', desc: 'Role-based access for advisors and their clients, with strict data separation and audit trails.' },
  { num: '06', title: 'Compliance Ready', desc: 'Designed around SEBI-compliant processes, record keeping, and client consent management.' },
];

export default function Features() {
  return (
    <section className="hairline-b bg-bone-deep" data-testid="features-section">
      <SectionContainer className="py-16 lg:py-24 grid grid-cols-12 gap-x-6">
        <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-32 lg:self-start mb-12 lg:mb-0">
          <div className="label-mono text-ash mb-4">&mdash; 003 &middot; Why</div>
          <h2 className="display text-[44px] lg:text-[72px]">
            Built for every<br/><em>rupee</em> you earn.
          </h2>
          <p className="text-ash text-[16px] lg:text-[18px] leading-[1.65] mt-8 max-w-md">
            Not a generic dashboard. A personalised financial command centre that understands
            Indian tax laws, inflation realities, and your unique life goals.
          </p>
          <div className="mt-10 pt-8 border-t border-line">
          <div className="font-mono text-[11px] uppercase tracking-wider2 text-ash mb-2">Trusted by</div>
          <div className="font-serif text-[28px] leading-tight">500+ advisory practices in India</div>
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
              className="bg-bone p-8 lg:p-10 group"
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
      </SectionContainer>
    </section>
  );
}