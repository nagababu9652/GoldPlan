'use client';

import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { Building2, Users, Briefcase, Target, Award, Handshake, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const sections = [
  {
    title: 'Our Firm',
    description: 'A research house, not a SaaS. We provide institutional-grade financial planning to individuals and families.',
    href: '/company/our-story',
    icon: Building2,
    items: ['Founded 2026', 'SEBI-Registered', 'Research-Driven', 'Client-First Approach'],
  },
  {
    title: 'Advisors & Clients',
    description: 'Allocators, family offices, treasuries, and individual investors trust our methodology.',
    href: '/company/advisors',
    icon: Users,
    items: ['50,000+ Families', '200+ HNIs', '40+ Corporate Clients', 'PAN India Presence'],
  },
  {
    title: 'Careers',
    description: 'Join our editorial and research team. We\'re looking for analysts, writers, and advisors.',
    href: '/company/careers',
    icon: Briefcase,
    items: ['Research Analysts', 'Financial Advisors', 'Content Writers', 'Tech Team'],
  },
  {
    title: 'Our Philosophy',
    description: 'Long-term, goal-based, and transparent. We believe in education over sales, and planning over products.',
    href: '/company/philosophy',
    icon: Target,
    items: ['Goal-Based Planning', 'Fee-Only Advisory', 'No Commissions', 'Full Transparency'],
  },
  {
    title: 'Awards & Recognition',
    description: 'Industry recognition for our research, advisory, and client education initiatives.',
    href: '/company/awards',
    icon: Award,
    items: ['Best Financial Advisor 2026', 'Innovation in FinTech', 'Top Research Team', 'Client Satisfaction Award'],
  },
  {
    title: 'Partners',
    description: 'We partner with leading AMCs, insurance providers, and financial institutions.',
    href: '/company/partners',
    icon: Handshake,
    items: ['40+ AMC Partners', 'All Major Insurers', 'RBI-Registered', 'BSE/NSE Members'],
  },
];

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-bone text-obsidian" data-testid="company-page">
      <Navigation />
      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; 007 &middot; Company</div>
              <h1 className="display text-[44px] lg:text-[64px]">
                Built for the <em>long run</em>
              </h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-6 max-w-2xl">
                We are a Hyderabad-based financial research house. Our mission is to make 
                institutional-quality financial planning accessible to every Indian family.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-3 lg:col-start-10 flex items-end">
              <Link href="/contact" className="btn-obsidian">Get in Touch</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line mb-12">
            {sections.map((sec, i) => (
              <div key={sec.title} className="bg-bone p-6 lg:p-8 flex flex-col" data-testid={`company-card-${i}`}>
                <div className="w-12 h-12 border border-obsidian flex items-center justify-center mb-5">
                  <sec.icon size={22} />
                </div>
                <div className="font-serif text-[22px] leading-tight mb-3">{sec.title}</div>
                <p className="text-[13px] text-ash leading-relaxed mb-5 flex-1">{sec.description}</p>
                <ul className="space-y-2 mb-6">
                  {sec.items.map((item) => (
                    <li key={item} className="text-[12px] text-ash font-mono flex items-center gap-2">
                      <span className="w-1 h-1 bg-antique rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={sec.href} className="group inline-flex items-center gap-2 text-[13px] font-medium hover:text-antique-dark transition-colors">
                  Learn More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>

          <div className="border border-obsidian bg-bone p-8 lg:p-10">
            <div className="grid grid-cols-12 gap-6 items-center">
              <div className="col-span-12 lg:col-span-7">
                <div className="label-mono text-ash mb-3">Our Office</div>
                <h2 className="font-serif text-[28px] lg:text-[36px] leading-tight mb-3">
                  Visit us in Hyderabad
                </h2>
                <p className="text-[14px] text-ash leading-relaxed max-w-lg">
                  FinPlan India Research Pvt. Ltd.<br />
                  Plot 42, Financial District,<br />
                  Gachibowli, Hyderabad — 500032<br />
                  Telangana, India
                </p>
              </div>
              <div className="col-span-12 lg:col-span-4 lg:col-start-9">
                <Link href="/contact" className="btn-obsidian w-full justify-center">
                  Schedule a Visit <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}