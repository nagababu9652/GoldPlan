'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-obsidian text-bone py-12" data-testid="site-footer">
      <div className="px-6 lg:px-10">
        {/* Top Section - Logo & Tagline */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-bone/10">
          <div>
            <Link href="/" className="font-serif text-[22px] text-antique inline-block mb-2">
              FinPlan<span className="text-bone">.</span>
            </Link>
            <p className="text-bone/60 text-[14px] max-w-md">
              India&rsquo;s trusted financial planning platform for smarter investing.
            </p>
          </div>
          <div className="flex gap-6">
            <Link href="/company" className="text-bone/70 hover:text-antique text-[14px] transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-bone/70 hover:text-antique text-[14px] transition-colors">
              Contact
            </Link>
            <Link href="/company/advisors" className="text-bone/70 hover:text-antique text-[14px] transition-colors">
              Advisors
            </Link>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="font-mono text-[11px] uppercase tracking-wider2 text-bone/40">
            &copy; 2026 FinPlan India Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="font-mono text-[11px] uppercase tracking-wider2 text-bone/40 hover:text-antique transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="font-mono text-[11px] uppercase tracking-wider2 text-bone/40 hover:text-antique transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}