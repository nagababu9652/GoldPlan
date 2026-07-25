'use client';

import { motion } from 'framer-motion';
import {
  Users, FileText, Shield, Target, BarChart3, CheckCircle2, ArrowUpRight,
} from 'lucide-react';
import SectionContainer from '@/components/shared/SectionContainer';

const services = [
  { icon: Users, title: 'Client Onboarding', desc: 'Structured client intake, KYC capture, and mandate setup without back-and-forth emails.', tag: 'Core', href: '/advisor-dashboard/clients' },
  { icon: BarChart3, title: 'Portfolio Oversight', desc: 'Unified view of client holdings, allocations, drift, and action items across asset classes.', tag: 'Core', href: '/advisor-dashboard/portfolio' },
  { icon: Target, title: 'Review Workflows', desc: 'Quarterly review templates, report generation, and client communication in one workspace.', tag: 'Operations', href: '/advisor-dashboard/reports' },
  { icon: FileText, title: 'Document Hub', desc: 'Centralised access to KYC, agreements, mandates, and statements with audited retrieval.', tag: 'Core', href: '/advisor-dashboard/documents' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Advisor and client logins with strict data separation and access control.', tag: 'Security', href: '/login' },
  { icon: CheckCircle2, title: 'Compliance Ready', desc: 'SEBI-compliant workflows, record keeping, and client consent management built in.', tag: 'Operations', href: '/contact' },
];

export default function Services() {
  return (
    <section id="solutions" className="hairline-b" data-testid="services-section">
      <SectionContainer className="py-16 lg:py-24 grid grid-cols-12 gap-6 hairline-b">
        <div className="col-span-12 lg:col-span-4">
          <div className="label-mono text-ash mb-3">&mdash; 002 &middot; Services</div>
              <h2 className="display text-[44px] lg:text-[64px]">
              Advisor workflows,<br/>one <em>purpose</em>.
            </h2>
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex items-end">
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6]">
              Every service is designed for advisor operations: onboarding, oversight, reviews, and compliance.
            </p>
        </div>
      </SectionContainer>

      <SectionContainer className="pb-16 lg:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.a
              key={s.title}
              href={s.href}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
              className={`group relative bg-bone p-8 lg:p-10 hairline-r hairline-b last:hairline-r-0 hover:bg-bone-deep transition-colors ${
                i >= 4 ? 'lg:hairline-b-0' : ''
              }`}
              data-testid={`service-card-${i}`}
            >
              <div className="flex items-start justify-between mb-10">
                <div className="w-12 h-12 border border-obsidian flex items-center justify-center group-hover:bg-obsidian group-hover:text-bone transition-colors">
                  <Icon size={20} />
                </div>
                <span className="label-mono text-ash">{s.tag}</span>
              </div>

              <h3 className="font-serif text-[26px] leading-tight mb-3 tracking-tight">
                {s.title}
              </h3>
              <p className="text-[14px] text-ash leading-relaxed mb-8">{s.desc}</p>

              <span className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider2 border-b border-obsidian pb-1 group-hover:text-antique-dark group-hover:border-antique-dark transition-colors">
                Learn more <ArrowUpRight size={12} />
              </span>

              <span className="absolute top-3 right-4 font-mono text-[10px] text-ash">
                0{i + 1}
              </span>
            </motion.a>
          );
        })}
        </div>
      </SectionContainer>
    </section>
  );
}