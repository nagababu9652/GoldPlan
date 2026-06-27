'use client';

import { motion } from 'framer-motion';
import { Mail, Linkedin, Twitter, Github } from 'lucide-react';

const footerLinks = {
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Solutions: [
    { label: 'Gold Planning', href: '#' },
    { label: 'Financial Reports', href: '#' },
    { label: 'Risk Assessment', href: '#' },
    { label: 'Market Intelligence', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Case Studies', href: '#' },
    { label: 'Templates', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'Compliance', href: '#' },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Mail, href: '#', label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-950/50 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-t from-gold-DEFAULT/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-20 pb-20 border-b border-white/5"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block px-4 py-2 rounded-full glass border border-gold-DEFAULT/30 text-gold-DEFAULT text-sm font-semibold mb-6">
                Stay Updated
              </span>
              <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
                Subscribe to our Newsletter
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Get the latest insights on gold prices, market trends, and financial forecasts delivered to your inbox.
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 glass px-6 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-gold-DEFAULT transition-smooth text-white placeholder-gray-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-gold text-black px-8 py-4 rounded-xl font-bold transition-smooth whitespace-nowrap"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Footer */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="col-span-2 md:col-span-1"
          >
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 gradient-gold rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-xl font-bold gradient-text">GoldPlan AI</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Advanced financial planning and market intelligence for modern businesses.
            </p>
          </motion.div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-gold-DEFAULT transition-smooth text-sm inline-block hover:translate-x-1"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-white/5 pt-10 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <p className="text-gray-400 text-sm">
            &copy; 2024 GoldPlan AI. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <motion.a
                  key={link.label}
                  href={link.href}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-gold-DEFAULT transition-smooth p-2 rounded-lg glass hover:glass-hover"
                  title={link.label}
                >
                  <Icon size={18} />
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
