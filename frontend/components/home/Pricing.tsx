'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$299',
    period: 'per month',
    description: 'Perfect for small investment portfolios',
    features: [
      'Up to 5 portfolio analyses',
      'Monthly reports',
      'Email support',
      'Basic risk assessment',
      'Market alerts',
    ],
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$999',
    period: 'per month',
    description: 'Ideal for growing businesses',
    features: [
      'Unlimited portfolio analyses',
      'Weekly reports',
      'Priority support',
      'Advanced risk modeling',
      'Real-time market data',
      'Custom dashboards',
      'API access',
      'White-label options',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact sales',
    description: 'For large-scale operations',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced automation',
      'Training & onboarding',
      'SLA guarantee',
      'Compliance reports',
    ],
    highlighted: false,
  },
];

export default function Pricing() {
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative border-y border-white/5">
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
            Pricing Plans
          </span>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto">
            Choose the plan that fits your business needs and scale as you grow
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative rounded-3xl p-8 transition-smooth ${
                plan.highlighted
                  ? 'glass-hover border-2 border-gold-DEFAULT shadow-2xl card-glow z-10'
                  : 'glass hover:glass-hover border border-white/5 hover:border-gold-DEFAULT/30'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="btn-gold text-black px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-bold gradient-text">{plan.price}</span>
                {plan.period && (
                  <span className="text-gray-400 text-sm ml-2">/ {plan.period}</span>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-4 rounded-xl font-bold mb-8 transition-smooth flex items-center justify-center gap-2 ${
                  plan.highlighted
                    ? 'btn-gold text-black'
                    : 'glass hover:glass-hover border border-white/10'
                }`}
              >
                Get Started <ArrowRight size={18} />
              </motion.button>

              <div className="space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-emerald-DEFAULT flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
