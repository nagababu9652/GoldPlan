'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '#', active: true },
  { label: 'Platform', href: '#solutions' },
  { label: 'Reports', href: '#reports' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '#' },
  { label: 'Company', href: '#' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobile = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5">
        <motion.header
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[1200px] rounded-2xl transition-all duration-500 bg-[#0B1120]/70 backdrop-blur-2xl border border-white/[0.05] shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center justify-between h-12 px-4 sm:px-5">
            {/* Left: Logo + Nav Container */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <a href="#" className="flex items-center gap-2 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center shadow-sm">
                  <svg className="w-3.5 h-3.5 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-[14px] font-semibold tracking-tight text-white">GoldPlan AI</span>
              </a>

              {/* Center Nav - Pill Style */}
              <nav className="hidden md:flex">
                <div className="flex items-center gap-0.5 bg-white/[0.03] border border-white/[0.04] rounded-full px-1.5 py-1">
                  {navItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="relative px-3 py-1.5 text-[13px] font-medium rounded-full transition-colors duration-200"
                    >
                      {item.active && (
                        <motion.span
                          layoutId="navPill"
                          className="absolute inset-0 rounded-full bg-white/[0.07] border border-white/[0.04]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className={`relative z-10 transition-colors duration-200 ${
                        item.active ? 'text-white' : 'text-slate-400 hover:text-white'
                      }`}>
                        {item.label}
                      </span>
                    </a>
                  ))}
                </div>
              </nav>
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-2">
              <a
                href="#"
                className="px-3 py-1.5 text-[13px] font-medium text-slate-400 hover:text-white transition-colors duration-200 rounded-full hover:bg-white/[0.04]"
              >
                Sign in
              </a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center px-4 py-1.5 text-[13px] font-semibold text-slate-900 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] rounded-full hover:shadow-[0_2px_8px_rgba(212,175,55,0.25)] transition-all duration-200"
              >
                Get Started
                <svg className="w-3 h-3 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </motion.a>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={16} className="text-white" /> : <Menu size={16} className="text-white" />}
            </button>
          </div>
        </motion.header>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[68px] left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 z-40 rounded-2xl border border-white/[0.06] bg-[#0B1120]/95 backdrop-blur-2xl shadow-xl shadow-black/40 md:hidden"
          >
            <div className="p-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={closeMobile}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    item.active
                      ? 'text-[#D4AF37] bg-[#D4AF37]/8'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {item.label}
                  {item.active && <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />}
                </a>
              ))}
              <hr className="my-2 mx-2 border-white/[0.06]" />
              <div className="space-y-1 px-1 pt-1">
                <a href="#" onClick={closeMobile} className="block rounded-xl px-3.5 py-2.5 text-center text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200">
                  Sign in
                </a>
                <a href="#" onClick={closeMobile} className="block rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C9A227] px-3.5 py-2.5 text-center text-sm font-semibold text-slate-900 transition-all duration-200">
                  Get Started
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}