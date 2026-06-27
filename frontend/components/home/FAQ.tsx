'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How accurate are the gold price predictions?',
    answer: 'Our AI models achieve 94%+ accuracy in price predictions based on historical data and market trends. We continuously refine our algorithms with the latest market data.',
  },
  {
    question: 'What data security measures are in place?',
    answer: 'We use bank-grade AES-256 encryption, comply with SOC 2 Type II, and maintain redundant backups. All data is encrypted both in transit and at rest.',
  },
  {
    question: 'Can I integrate GoldPlan with my existing systems?',
    answer: 'Yes! We offer REST APIs and webhooks for seamless integration with your existing financial software and reporting systems.',
  },
  {
    question: 'How long does it take to generate a report?',
    answer: 'Most reports are generated within 24 hours. For real-time analysis, our dashboard provides instant updates and live insights.',
  },
  {
    question: 'Do you offer training for our team?',
    answer: 'Absolutely. Enterprise plans include comprehensive training, onboarding sessions, and ongoing support from our financial experts.',
  },
  {
    question: 'What is your uptime guarantee?',
    answer: 'We guarantee 99.9% uptime with our premium infrastructure. Enterprise customers receive SLA guarantees with service credits.',
  },
  {
    question: 'Can I export reports in different formats?',
    answer: 'Yes. Reports can be exported as PDF, Excel, CSV, or accessed via our API in JSON format for your convenience.',
  },
  {
    question: 'Is there a free trial available?',
    answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to get started.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative border-y border-white/5">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-DEFAULT/5 to-transparent" />

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 rounded-full glass border border-emerald-DEFAULT/30 text-emerald-DEFAULT text-sm font-semibold mb-6">
            FAQ
          </span>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions about GoldPlan AI
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass rounded-2xl overflow-hidden hover:glass-hover transition-smooth border border-white/5 hover:border-emerald-DEFAULT/30"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 lg:px-8 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-smooth group"
              >
                <h3 className="text-lg font-semibold text-white pr-4 group-hover:text-emerald-DEFAULT transition-smooth">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <div className="p-2 rounded-lg gradient-emerald group-hover:scale-110 transition-smooth">
                    <ChevronDown className="text-slate-900" size={20} />
                  </div>
                </motion.div>
              </button>

              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: openIndex === index ? 1 : 0,
                  height: openIndex === index ? 'auto' : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 lg:px-8 pb-6 text-gray-400 leading-relaxed border-t border-white/10 pt-5">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
