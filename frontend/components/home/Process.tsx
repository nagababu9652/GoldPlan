'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const steps = [
  {
    number: '1',
    title: 'Register',
    description: 'Create your account and set up your business profile in minutes.',
  },
  {
    number: '2',
    title: 'Upload Requirements',
    description: 'Submit your financial data and reporting requirements securely.',
  },
  {
    number: '3',
    title: 'AI Analysis',
    description: 'Our AI engine processes your data with advanced algorithms.',
  },
  {
    number: '4',
    title: 'Expert Review',
    description: 'Financial experts review and validate all analyses.',
  },
  {
    number: '5',
    title: 'Download Reports',
    description: 'Access comprehensive, actionable reports in multiple formats.',
  },
  {
    number: '6',
    title: 'Business Growth',
    description: 'Implement insights and watch your business thrive.',
  },
];

export default function Process() {
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
            How It Works
          </span>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Simple <span className="gradient-text">Process</span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto">
            Get started in six easy steps and transform your financial planning
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connecting line */}
              {index < steps.length - 1 && index % 3 !== 2 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-emerald-DEFAULT/50 to-gold-DEFAULT/50" />
              )}

              <div className="glass p-8 rounded-2xl hover:glass-hover transition-smooth card-glow border border-white/5 hover:border-emerald-DEFAULT/30 group h-full">
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative">
                    <div className="w-14 h-14 gradient-emerald rounded-xl flex items-center justify-center font-bold text-slate-900 text-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-smooth">
                      {step.number}
                    </div>
                    <div className="absolute -inset-2 bg-emerald-DEFAULT/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-smooth" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-DEFAULT transition-smooth">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
