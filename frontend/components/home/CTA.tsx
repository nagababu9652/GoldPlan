'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';

export default function CTA() {
  return (
    <section className="hairline-b bg-bone" data-testid="cta-section">
      <div className="px-6 lg:px-10 py-20 lg:py-32 relative">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-2 order-2 lg:order-1">
            <div className="label-mono text-ash">— 009</div>
            <div className="label-mono text-antique-dark mt-1">Get Started</div>
          </div>

          <div className="col-span-12 lg:col-span-9 order-1 lg:order-2">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="display text-[56px] sm:text-[80px] lg:text-[112px]"
            >
              Start your<br/>
              <em>financial journey</em>. Today.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 grid grid-cols-12 gap-6 items-end"
            >
              <p className="col-span-12 lg:col-span-6 text-[16px] lg:text-[18px] leading-[1.65] text-ash">
                Sign up for a free 14-day trial. Get full platform access, a personalised
                financial health report, and one complimentary session with a SEBI-registered
                advisor. No credit card needed.
              </p>

              <div className="col-span-12 lg:col-span-6 flex flex-col sm:flex-row gap-3 lg:justify-end">
                <a href="#" className="btn-obsidian" data-testid="cta-primary">
                  Start free trial <ArrowRight size={16} />
                </a>
                <a href="#" className="btn-outline" data-testid="cta-secondary">
                  <Calendar size={16} /> Book a call
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-10 pt-10 border-t border-line flex items-center gap-8 flex-wrap"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full live-dot" />
                <span className="label-mono text-ash">14-day free trial</span>
              </div>
              <span className="label-mono text-ash">No credit card required</span>
              <span className="label-mono text-ash">Onboarded in 24 hours</span>
            </motion.div>
          </div>

          <div className="hidden lg:block lg:col-span-1 order-3" />
        </div>
      </div>
    </section>
  );
}
