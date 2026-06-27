'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-DEFAULT/10 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-DEFAULT/20 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 md:p-20 text-center border-2 border-gold-DEFAULT/30 card-glow relative overflow-hidden"
        >
          {/* Inner gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gold-DEFAULT/10 via-transparent to-emerald-DEFAULT/10 rounded-3xl" />

          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-6xl font-bold mb-6"
            >
              Ready to Transform Your{' '}
              <span className="gradient-text">Financial Planning?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-lg lg:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Join leading financial institutions that trust GoldPlan AI to deliver
              accurate insights and drive smarter investment decisions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(212, 175, 55, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="btn-gold text-black px-10 py-5 rounded-xl font-bold flex items-center justify-center gap-2 transition-smooth text-lg"
              >
                Get Started <ArrowRight size={22} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass px-10 py-5 rounded-xl font-bold hover:glass-hover transition-smooth flex items-center justify-center gap-2 border-2 border-white/10 hover:border-gold-DEFAULT/50 text-lg"
              >
                <Calendar size={22} /> Book Demo
              </motion.button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-sm text-gray-400"
            >
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-DEFAULT rounded-full animate-pulse" />
                14-day free trial • No credit card required • Get started in minutes
              </span>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
