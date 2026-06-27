'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Brain,
  Shield,
  Target,
  LineChart,
  Zap,
} from 'lucide-react';

const services = [
  {
    icon: BarChart3,
    title: 'Gold Planning Reports',
    description: 'Comprehensive analysis of precious metal investments with market trends and forecasts.',
  },
  {
    icon: TrendingUp,
    title: 'Financial Reports',
    description: 'Detailed financial statements and performance metrics for informed decision-making.',
  },
  {
    icon: LineChart,
    title: 'Investment Forecasting',
    description: 'AI-powered predictions for investment performance and market movements.',
  },
  {
    icon: Brain,
    title: 'Market Intelligence',
    description: 'Real-time market data and insights powered by advanced analytics.',
  },
  {
    icon: Shield,
    title: 'Risk Assessment',
    description: 'Comprehensive risk analysis and mitigation strategies for your portfolio.',
  },
  {
    icon: Target,
    title: 'Portfolio Optimization',
    description: 'Strategic allocation recommendations to maximize returns and minimize risk.',
  },
  {
    icon: Zap,
    title: 'Business Analytics',
    description: 'Deep insights into business performance and operational efficiency metrics.',
  },
  {
    icon: PieChart,
    title: 'AI Insights',
    description: 'Machine learning-driven insights for smarter financial strategies.',
  },
];

export default function Services() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="solutions" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-DEFAULT/5 to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 rounded-full glass border border-gold-DEFAULT/30 text-gold-DEFAULT text-sm font-semibold mb-6">
            What We Offer
          </span>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto">
            Comprehensive financial solutions powered by AI to help your business thrive in today's competitive market
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass p-6 rounded-2xl hover:glass-hover transition-smooth group cursor-pointer card-glow border border-white/5 hover:border-gold-DEFAULT/30"
              >
                <div className="mb-5 p-4 w-fit gradient-gold rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-smooth shadow-lg">
                  <Icon size={28} className="text-slate-900" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-gold-DEFAULT transition-smooth">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">
                  {service.description}
                </p>
                <motion.button
                  whileHover={{ x: 5 }}
                  className="text-gold-DEFAULT text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  Learn More <span className="text-lg">→</span>
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
