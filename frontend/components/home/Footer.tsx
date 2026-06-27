'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Mail, Linkedin, Twitter, Github } from 'lucide-react';

const footerLinks = {
  Platform: [
    { label: 'Market Intelligence', href: '#' },
    { label: 'Forecasting',         href: '#' },
    { label: 'Risk Console',        href: '#' },
    { label: 'Report Builder',      href: '#' },
  ],
  Reports: [
    { label: 'Gold Quarterly',    href: '#' },
    { label: 'Silver & Platinum', href: '#' },
    { label: 'FX & Macro',        href: '#' },
    { label: 'Allocation',        href: '#' },
  ],
  Resources: [
    { label: 'Field Notes',   href: '#' },
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Academy',       href: '#' },
  ],
  Company: [
    { label: 'About',    href: '#' },
    { label: 'Clients',  href: '#' },
    { label: 'Careers',  href: '#' },
    { label: 'Press',    href: '#' },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter,  href: '#', label: 'Twitter / X' },
  { icon: Github,   href: '#', label: 'GitHub' },
  { icon: Mail,     href: '#', label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="bg-obsidian text-bone" data-testid="site-footer">
      {/* Newsletter strip */}
      <div className="px-6 lg:px-10 py-16 lg:py-20 border-b border-bone/10 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6">
          <div className="label-mono text-antique mb-4">— Subscribe</div>
          <h3 className="display text-[36px] lg:text-[56px] text-bone">
            The morning wire,<br/>posted by <em className="text-antique">06:30 GMT</em>.
          </h3>
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex flex-col justify-end gap-5">
          <p className="text-bone/65 text-[15px] lg:text-[16px] leading-[1.65] max-w-lg">
            A 4-minute editorial brief on gold, FX and macro — delivered by named editors,
            read on six continents. Free. Indefinite.
          </p>
          <form className="flex flex-col sm:flex-row gap-3" data-testid="newsletter-form">
            <input
              type="email"
              required
              placeholder="you@firm.com"
              className="flex-1 bg-transparent border border-bone/20 px-5 py-3.5 text-[14px] text-bone placeholder:text-bone/40 focus:border-antique focus:outline-none transition-colors"
              data-testid="newsletter-input"
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-antique text-obsidian font-medium text-[14px] hover:bg-bone transition-colors flex items-center justify-center gap-2"
              data-testid="newsletter-submit"
            >
              Subscribe <ArrowUpRight size={14} />
            </button>
          </form>
          <p className="font-mono text-[11px] uppercase tracking-wider2 text-bone/40">
            One email weekly. Unsubscribe in one click.
          </p>
        </div>
      </div>

      {/* Link columns */}
      <div className="px-6 lg:px-10 py-16 grid grid-cols-12 gap-10 border-b border-bone/10">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="col-span-12 lg:col-span-4"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-antique text-obsidian flex items-center justify-center">
              <span className="font-serif text-[20px] leading-none">G</span>
            </div>
            <div className="leading-none">
              <div className="font-serif text-[22px]">GoldPlan<span className="text-antique">.</span></div>
              <div className="label-mono text-bone/40 mt-1">EST. MMXXVI · LONDON</div>
            </div>
          </div>
          <p className="text-bone/65 text-[14px] leading-[1.7] max-w-sm">
            A research practice for capital that thinks in decades. Editorial intelligence
            on gold, FX and macro — delivered as software.
          </p>
          <div className="mt-8 pt-6 border-t border-bone/10">
            <div className="label-mono text-bone/40 mb-2">Editorial Desk</div>
            <div className="font-serif text-[18px]">12 St. James's Square</div>
            <div className="text-bone/60 text-[13px] mt-0.5">London, SW1Y 4LE · United Kingdom</div>
          </div>
        </motion.div>

        {/* Columns */}
        {Object.entries(footerLinks).map(([category, links], idx) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="col-span-6 lg:col-span-2"
          >
            <div className="label-mono text-antique mb-5 pb-3 border-b border-bone/10">
              {category}
            </div>
            <ul className="space-y-3">
              {links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-bone/70 hover:text-antique text-[14px] u-link">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="px-6 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <p className="font-mono text-[11px] uppercase tracking-wider2 text-bone/50">
            © MMXXVI GoldPlan AI Ltd. All rights reserved.
          </p>
          <a href="#" className="font-mono text-[11px] uppercase tracking-wider2 text-bone/50 hover:text-antique transition-colors">Privacy</a>
          <a href="#" className="font-mono text-[11px] uppercase tracking-wider2 text-bone/50 hover:text-antique transition-colors">Terms</a>
          <a href="#" className="font-mono text-[11px] uppercase tracking-wider2 text-bone/50 hover:text-antique transition-colors">Compliance</a>
        </div>

        <div className="flex items-center gap-2">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                className="w-9 h-9 border border-bone/20 flex items-center justify-center hover:border-antique hover:text-antique transition-colors"
                data-testid={`social-${link.label.toLowerCase()}`}
              >
                <Icon size={14} />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
