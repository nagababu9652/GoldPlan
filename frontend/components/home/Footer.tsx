'use client';

import Link from 'next/link';

export default function Footer() {
  const sections = [
    {
      title: 'Product',
      links: [['How It Works','/how-it-works'],['Features','/features'],['Pricing','/pricing'],['Updates','/updates']]
    },
    {
      title: 'Company',
      links: [['About','/company'],['Careers','/careers'],['Contact','/contact']]
    },
    {
      title: 'Advisors',
      links: [['Advisor Login','/login'],['Request Demo','/contact'],['Support','/contact']]
    }
  ];

  return (
    <footer className="border-t border-bone/10 bg-obsidian text-bone ">
      <div className="border-10 border-black mx-auto max-w-7xl px-6 py-20">
        <div
          className="grid gap-12"
          style={{gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))'}}
        >
          <div className="max-w-md">
            <Link href="/" className="font-serif text-4xl text-antique">
              FinPlan<span className="text-bone">.</span>
            </Link>
            <p className="mt-5 leading-7 text-bone/60">
              The advisor operating system for client onboarding, portfolio oversight, and review workflows.
            </p>
            <div className="mt-8 flex flex-wrap gap-5 text-sm">
              <Link href="#" className="hover:text-antique">LinkedIn</Link>
              <Link href="#" className="hover:text-antique">X</Link>
              <Link href="#" className="hover:text-antique">YouTube</Link>
            </div>
          </div>

          {sections.map((s)=>(
            <div key={s.title}>
              <h3 className="mb-5 text-xs uppercase tracking-[0.25em] text-antique">
                {s.title}
              </h3>
              <ul className="space-y-4">
                {s.links.map(([label,href])=>(
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-bone/70 transition-all duration-300 hover:translate-x-1 hover:text-antique inline-block"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="my-14 border-t border-bone/10"></div>

        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <h3 className="mb-4 text-xs uppercase tracking-[0.25em] text-antique">
              Disclaimer
            </h3>
            <p className="max-w-3xl text-sm leading-7 text-bone/50">
              Investments are subject to market risks. Read all scheme related
              documents carefully before investing. Past performance does not
              guarantee future returns. FinPlan provides financial planning and
              educational tools only.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xs uppercase tracking-[0.25em] text-antique">
              Legal
            </h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <Link href="/privacy" className="hover:text-antique">Privacy</Link>
              <Link href="/terms" className="hover:text-antique">Terms</Link>
              <Link href="/cookies" className="hover:text-antique">Cookies</Link>
              <Link href="/disclaimer" className="hover:text-antique">Disclaimer</Link>
            </div>
          </div>
        </div>

        <div className="my-10 border-t border-bone/10"></div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-bone/40">
          <p>© 2026 FinPlan India Pvt. Ltd. All rights reserved.</p>
          <div className="flex flex-wrap gap-6">
            <span>🔒 Secure Platform</span>
            <span>📈 Trusted Planning</span>
            <span>🇮🇳 Built for India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
