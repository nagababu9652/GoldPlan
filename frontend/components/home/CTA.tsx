'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import SectionContainer from '@/components/shared/SectionContainer';

export default function CTA() {
  return (
    <section className="hairline-b bg-bone" data-testid="cta-section">
      <SectionContainer className="py-20 lg:py-28 relative">
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
                Scale your<br/>
                <em>advisory practice</em>.
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-12 grid grid-cols-12 gap-6 items-end"
              >
                <p className="col-span-12 lg:col-span-6 text-[16px] lg:text-[18px] leading-[1.65] text-ash">
                  Book a demo to see how FinPlan India streamlines client onboarding, portfolio oversight, and review workflows for modern advisory teams.
                </p>

                <div className="col-span-12 lg:col-span-6 flex flex-col sm:flex-row gap-3 lg:justify-end">
                  <a href="/contact" className="btn-obsidian" data-testid="cta-primary">
                    Request Demo <ArrowRight size={16} />
                  </a>
                  <a href="/login" className="btn-outline" data-testid="cta-secondary">
                    Advisor Login
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
                  <span className="label-mono text-ash">Advisor-first platform</span>
                </div>
                <span className="label-mono text-ash">SEBI-compliant workflows</span>
                <span className="label-mono text-ash">Dedicated onboarding support</span>
              </motion.div>
          </div>

          <div className="hidden lg:block lg:col-span-1 order-3" />
        </div>
      </SectionContainer>
    </section>
  );
}