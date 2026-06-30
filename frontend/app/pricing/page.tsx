'use client';

import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'Perfect for getting started with basic financial planning.',
    features: [
      'Basic SIP Calculator',
      'Goal Tracker (3 goals)',
      'Portfolio Review (1x per quarter)',
      'Email Support',
    ],
    cta: 'Get Started',
    href: '/signup',
    featured: false,
  },
  {
    name: 'Professional',
    price: '₹999',
    period: '/month',
    description: 'For serious investors who want comprehensive planning tools.',
    features: [
      'All Calculators (10+ tools)',
      'Unlimited Goal Tracking',
      'Portfolio Review (Monthly)',
      'SEBI Advisor Consultation (1x/month)',
      'Priority Support',
      'Tax Optimization Reports',
    ],
    cta: 'Start Free Trial',
    href: '/signup',
    featured: true,
  },
  {
    name: 'Premium',
    price: '₹2,499',
    period: '/month',
    description: 'Complete wealth management with dedicated advisor support.',
    features: [
      'Everything in Professional',
      'Dedicated SEBI Registered Advisor',
      'Unlimited Consultations',
      'Custom Financial Plan',
      'Family Portfolio Management',
      'Estate Planning Assistance',
      '24/7 Priority Support',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-bone text-obsidian">
      <Navigation />
      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-20 lg:py-32">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; Pricing</div>
              <h1 className="display text-[44px] lg:text-[64px]">
                Simple, <em>transparent</em> pricing
              </h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-6 max-w-2xl">
                Start free, upgrade when you need more. All plans include access to our core calculators and tools.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative border transition-colors ${
                  plan.featured
                    ? 'border-obsidian bg-bone-deep'
                    : 'border-line bg-bone hover:bg-bone-deep'
                }`}
                style={{ padding: '32px' }}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-8 bg-antique text-bone text-[11px] font-mono uppercase tracking-wider2 px-3 py-1">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-serif text-[24px] leading-tight mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-[40px] leading-none">{plan.price}</span>
                    {plan.period && (
                      <span className="text-ash text-[14px]">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-[14px] text-ash mt-3 leading-relaxed">{plan.description}</p>
                </div>

                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3.5 px-6 text-[14px] font-medium transition-colors mb-8 ${
                    plan.featured
                      ? 'btn-obsidian'
                      : 'btn-outline'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-4 text-[14px]">
                      <div className="w-6 h-6 border-2 border-antique flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="text-antique" />
                      </div>
                      <span className="text-obsidian leading-relaxed font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-24 border-t border-line pt-16">
            <h2 className="font-serif text-[32px] leading-tight mb-10">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  q: 'Can I switch plans later?',
                  a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we prorate any differences.',
                },
                {
                  q: 'Is there a free trial?',
                  a: 'Yes, all new users get 14 days free trial of the Professional plan. No credit card required to start.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit/debit cards, UPI, net banking, and wallets via Razorpay.',
                },
                {
                  q: 'Can I cancel anytime?',
                  a: 'Absolutely. There are no long-term contracts. Cancel anytime from your account settings.',
                },
              ].map((faq) => (
                <div key={faq.q} className="border-b border-line pb-6">
                  <h3 className="font-serif text-[18px] leading-tight mb-2">{faq.q}</h3>
                  <p className="text-[13px] text-ash leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}