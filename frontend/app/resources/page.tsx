'use client';

import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { Newspaper, BookOpen, GraduationCap, FileText, Video, Podcast, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const resources = [
  {
    title: 'Field Notes',
    description: 'Weekly editorial on markets, gold, and economic trends. Insights from our research team.',
    href: '/resources/blog',
    icon: Newspaper,
    articles: ['Market Outlook 2026', 'Gold vs Equities', 'Budget Analysis', 'Global Trends'],
  },
  {
    title: 'SIP Basics Guide',
    description: 'Everything you need to know about Systematic Investment Plans. From入门 to mastery.',
    href: '/resources/sip-basics',
    icon: BookOpen,
    articles: ['What is SIP?', 'SIP vs Lumpsum', 'Step-Up SIP Strategy', 'SIP Calculator Guide'],
  },
  {
    title: 'Tax Guide',
    description: 'Comprehensive tax planning resources. Save more with smart 80C, 80D, and capital gains strategies.',
    href: '/resources/tax-guide',
    icon: FileText,
    articles: ['Income Tax Slabs', '80C Complete Guide', 'Capital Gains Tax', 'HRA Exemption'],
  },
  {
    title: 'Financial Academy',
    description: 'Courses for analysts and investors. From beginner to advanced financial planning.',
    href: '/resources/academy',
    icon: GraduationCap,
    articles: ['Investment Basics', 'Portfolio Theory', 'Risk Management', 'Behavioral Finance'],
  },
  {
    title: 'Video Library',
    description: 'Watch expert sessions, market analysis, and financial planning tutorials.',
    href: '/resources/videos',
    icon: Video,
    articles: ['Expert Interviews', 'Market Analysis', 'Tool Tutorials', 'Webinar Recordings'],
  },
  {
    title: 'Podcasts',
    description: 'Listen to our weekly podcast on personal finance, investing, and market trends.',
    href: '/resources/podcasts',
    icon: Podcast,
    articles: ['Weekly Market Wrap', 'Goal Planning Series', 'Tax Season Special', 'Expert Chats'],
  },
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-bone text-obsidian" data-testid="resources-page">
      <Navigation />
      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; 006 &middot; Resources</div>
              <h1 className="display text-[44px] lg:text-[64px]">
                Learn & <em>grow</em>
              </h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-6 max-w-2xl">
                From market insights to financial education — explore our curated resources 
                designed to make you a smarter investor.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-3 lg:col-start-10 flex items-end">
              <Link href="/resources/blog" className="btn-obsidian">Latest Articles</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line mb-12">
            {resources.map((res, i) => (
              <div key={res.title} className="bg-bone p-6 lg:p-8 flex flex-col" data-testid={`resource-card-${i}`}>
                <div className="w-12 h-12 border border-obsidian flex items-center justify-center mb-5">
                  <res.icon size={22} />
                </div>
                <div className="font-serif text-[22px] leading-tight mb-3">{res.title}</div>
                <p className="text-[13px] text-ash leading-relaxed mb-5 flex-1">{res.description}</p>
                <ul className="space-y-2 mb-6">
                  {res.articles.map((article) => (
                    <li key={article} className="text-[12px] text-ash font-mono flex items-center gap-2">
                      <span className="w-1 h-1 bg-antique rounded-full" />
                      {article}
                    </li>
                  ))}
                </ul>
                <Link href={res.href} className="group inline-flex items-center gap-2 text-[13px] font-medium hover:text-antique-dark transition-colors">
                  Explore {res.title} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>

          <div className="border border-obsidian bg-bone p-8 lg:p-10">
            <div className="grid grid-cols-12 gap-6 items-center">
              <div className="col-span-12 lg:col-span-7">
                <div className="label-mono text-ash mb-3">Newsletter</div>
                <h2 className="font-serif text-[28px] lg:text-[36px] leading-tight mb-3">
                  Get weekly insights in your inbox
                </h2>
                <p className="text-[14px] text-ash leading-relaxed max-w-lg">
                  Join 10,000+ subscribers. Every Sunday, we send you market analysis, 
                  tax tips, and curated financial news.
                </p>
              </div>
              <div className="col-span-12 lg:col-span-4 lg:col-start-9">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-3 border border-obsidian bg-bone text-[13px] focus:outline-none"
                  />
                  <button className="btn-obsidian whitespace-nowrap">Subscribe</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}