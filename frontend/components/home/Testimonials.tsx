'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CFO at Wealth Advisors Inc',
    company: 'Wealth Advisors',
    rating: 5,
    text: 'GoldPlan AI transformed how we analyze precious metal investments. The insights are invaluable.',
    avatar: '👩‍💼',
  },
  {
    name: 'Michael Chen',
    role: 'Investment Director at Global Finance',
    company: 'Global Finance',
    rating: 5,
    text: 'The accuracy of their reports is unmatched. We\'ve seen 34% improvement in portfolio performance.',
    avatar: '👨‍💼',
  },
  {
    name: 'Emily Rodriguez',
    role: 'CEO at Investment Partners LLC',
    company: 'Investment Partners',
    rating: 5,
    text: 'Outstanding platform. The AI insights help us make better decisions faster than ever before.',
    avatar: '👩‍💼',
  },
];

export default function Testimonials() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
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
            Testimonials
          </span>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            What Our Clients <span className="gradient-text">Say</span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto">
            Join thousands of satisfied financial professionals worldwide
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass p-8 rounded-2xl hover:glass-hover transition-smooth card-glow border border-white/5 hover:border-gold-DEFAULT/30"
            >
              {/* Quote icon and rating */}
              <div className="flex items-start justify-between mb-6">
                <div className="text-4xl text-gold-DEFAULT/30">"</div>
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} size={18} className="fill-gold-DEFAULT text-gold-DEFAULT" />
                  ))}
                </div>
              </div>

              {/* Quote */}
              <p className="text-gray-300 mb-8 leading-relaxed text-lg italic">
                {testimonial.text}
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <p className="font-bold text-white text-lg">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                  <p className="text-xs text-gold-DEFAULT font-semibold">{testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
