'use client';

import { motion } from 'framer-motion';

const companies = [
  'Goldman Sachs',
  'Morgan Stanley',
  'JPMorgan Chase',
  'BlackRock',
  'Vanguard',
];

export default function TrustedBy() {
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
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative border-y border-white/5">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-DEFAULT/5 to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-gray-400 mb-14 text-lg font-medium"
        >
          Trusted by leading financial institutions worldwide
        </motion.p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-5 gap-6"
        >
          {companies.map((company) => (
            <motion.div
              key={company}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex items-center justify-center"
            >
              <div className="glass px-8 py-5 rounded-xl hover:glass-hover transition-smooth cursor-pointer card-glow border border-white/5 hover:border-gold-DEFAULT/30 w-full">
                <p className="text-gray-300 font-bold text-center text-sm sm:text-base tracking-wide">
                  {company}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
