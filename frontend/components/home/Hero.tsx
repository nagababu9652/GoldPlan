'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="relative pt-44 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gold-DEFAULT/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-DEFAULT/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight"
            >
              Smarter{' '}
              <span className="gradient-text">Gold Planning</span>
              <br />
              for Smarter Businesses
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed max-w-2xl"
            >
              Transform your financial strategy with AI-powered gold planning reports, 
              investment forecasting, risk analysis, and real-time market intelligence. 
              Make confident decisions with data-driven insights.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-gold text-black px-10 py-5 rounded-xl font-bold flex items-center justify-center gap-2 transition-smooth text-lg"
              >
                Request Demo <ArrowRight size={22} />
              </motion.button>
              
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold gradient-text">500+</p>
                <p className="text-sm text-gray-400">Enterprise Clients</p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                <p className="text-3xl font-bold gradient-text">$2.5B+</p>
                <p className="text-sm text-gray-400">Assets Analyzed</p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                <p className="text-3xl font-bold gradient-text">99.9%</p>
                <p className="text-sm text-gray-400">Accuracy Rate</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Illustration Area - Proper Grid Layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Background gradient orb */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-DEFAULT/20 via-emerald-DEFAULT/10 to-transparent rounded-3xl blur-3xl" />

            <div className="glass p-12 lg:p-16 rounded-3xl card-glow border-2 border-gold-DEFAULT/20 bg-gradient-to-br from-slate-900/60 to-slate-950/60">
              <div className="relative flex flex-col gap-16">
                {/* Row 1: Live Gold Price + Market Trend side by side */}
                <div className="grid grid-cols-2 gap-12">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="glass p-8 rounded-2xl card-glow border border-gold-DEFAULT/20"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-sm text-gray-400 font-medium">Live Gold Price</span>
                      <TrendingUp size={20} className="text-emerald-DEFAULT" />
                    </div>
                    <p className="text-4xl lg:text-5xl font-bold gradient-text mb-3">$2,048.50</p>
                    <p className="text-base text-emerald-DEFAULT font-semibold">+2.5% today</p>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="glass p-8 rounded-2xl card-glow border border-emerald-DEFAULT/20"
                  >
                    <div className="text-sm text-gray-400 font-medium mb-6">Market Trend</div>
                    <p className="text-4xl lg:text-5xl font-bold text-emerald-DEFAULT mb-3">Bullish</p>
                    <p className="text-base text-gray-500">Strong momentum detected</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
