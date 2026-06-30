'use client';

import Navigation from './home/Navigation';
import Footer from './home/Footer';

type PageTemplateProps = {
  title: string;
  subtitle: string;
  number: string;
  children: React.ReactNode;
};

export default function PageTemplate({ title, subtitle, number, children }: PageTemplateProps) {
  return (
    <main className="min-h-screen bg-bone text-obsidian" data-testid="generic-page">
      <Navigation />

      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; {number} &middot; {subtitle}</div>
              <h1 className="display text-[44px] lg:text-[64px]">{title}</h1>
            </div>
            <div className="col-span-12 lg:col-span-3 lg:col-start-10 flex items-end">
              <a href="/contact" className="btn-obsidian">Get Started</a>
            </div>
          </div>

          <div className="prose max-w-none">
            {children}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
