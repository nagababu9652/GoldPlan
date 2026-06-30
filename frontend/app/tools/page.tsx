'use client';

import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { tools } from '@/lib/tools-data';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function ToolsPage() {
  const categories = [
    { key: 'investment', label: 'Investment Calculators' },
    { key: 'loan', label: 'Loan Calculators' },
    { key: 'goal', label: 'Goal & Planning' },
  ] as const;

  return (
    <main className="min-h-screen bg-bone text-obsidian">
      <Navigation />

      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-20 lg:py-32">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; Tools</div>
              <h1 className="display text-[44px] lg:text-[64px]">
                Financial <em>Tools</em>
              </h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-6 max-w-2xl">
                Plan smarter with our suite of financial calculators. From SIP returns to retirement 
                planning, make data-driven decisions for your financial future.
              </p>
            </div>
          </div>

          {categories.map(({ key, label }) => (
            <div key={key} className="mb-16 last:mb-0">
              <h2 className="font-serif text-[28px] leading-tight mb-8">{label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools
                  .filter((t) => t.category === key)
                  .map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        className="group border border-line bg-bone hover:bg-bone-deep transition-colors"
                        style={{ padding: '28px' }}
                      >
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-12 h-12 border border-obsidian flex items-center justify-center group-hover:bg-obsidian group-hover:text-bone transition-colors">
                            <Icon size={22} className={tool.color} />
                          </div>
                          <div>
                            <h3 className="font-serif text-[20px] leading-tight group-hover:text-antique-dark transition-colors">
                              {tool.title}
                            </h3>
                          </div>
                        </div>
                        <p className="text-[13px] text-ash leading-relaxed mb-4">
                          {tool.description}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[12px] font-mono uppercase tracking-wider2 text-obsidian group-hover:text-antique-dark transition-colors">
                          Open Tool <ArrowUpRight size={12} />
                        </span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </section>
      </div>

      <Footer />
    </main>
  );
}