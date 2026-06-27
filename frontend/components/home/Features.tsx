'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const features = [
  {
    title: 'AI Powered Analytics',
    description: 'Advanced machine learning algorithms for predictive analysis and insights.',
  },
  {
    title: '99.9% Data Accuracy',
    description: 'Verified data sources with stringent quality control processes.',
  },
  {
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and compliance with international standards.',
  },
  {
    title: 'Real-time Gold Prices',
    description: 'Live market feeds updated every second with global exchanges.',
  },
  {
    title: 'Industry Experts',
    description: 'Team of financial analysts with 200+ years combined experience.',
  },
  {
    title: 'Custom Reports',
    description: 'Tailored analysis and reports specific to your business needs.',
  },
];

export default function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative border-y border-white/5">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-DEFAULT/5 to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 rounded-full glass border border-emerald-DEFAULT/30 text-emerald-DEFAULT text-sm font-semibold mb-6">
            Why Choose Us
          </span>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Why Choose <span className="gradient-text">GoldPlan AI</span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto">
            The most advanced financial planning platform trusted by industry leaders worldwide
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="flex gap-5 glass p-7 rounded-2xl hover:glass-hover transition-smooth card-glow border border-white/5 hover:border-emerald-DEFAULT/30 group"
            >
              <div className="flex-shrink-0">
                <div className="p-3 gradient-emerald rounded-xl group-hover:scale-110 transition-smooth shadow-lg">
                  <CheckCircle2 className="text-slate-900" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-DEFAULT transition-smooth">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
