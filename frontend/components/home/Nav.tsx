"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogOut, User, Menu } from 'lucide-react';

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-[#050816]/80 to-transparent backdrop-blur-md border-b border-white/6">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-gold text-2xl font-semibold tracking-wide" style={{color: '#D4AF37'}}>
            GoldPlan AI
          </div>
          <nav className="hidden md:flex items-center gap-6 text-gray-300">
            <Link href="#">Home</Link>
            <Link href="#solutions">Solutions</Link>
            <Link href="#reports">Reports</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="#resources">Resources</Link>
            <Link href="#about">About</Link>
            <Link href="#contact">Contact</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-300 hover:text-white">Login</Link>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="#get-started"
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-[#D4AF37] px-4 py-2 text-black font-semibold shadow-md"
          >
            Get Started
          </motion.a>
          <div className="md:hidden">
            <Menu className="text-gray-300" />
          </div>
        </div>
      </div>
    </header>
  );
}
