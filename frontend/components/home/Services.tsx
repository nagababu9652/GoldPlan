'use client';

import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, PieChart, Brain, Shield, Target, LineChart, Zap, ArrowUpRight,
} from 'lucide-react';

const services = [
  { icon: BarChart3, title: 'Gold Planning Reports', desc: 'Comprehensive analysis of precious-metal exposure with macro context and forward signals.', tag: 'Flagship' },
  { icon: TrendingUp, title: 'Financial Reports',    desc: 'Board-grade financial statements and performance briefings for informed governance.',     tag: 'Quarterly' },
  { icon: LineChart,  title: 'Investment Forecasting', desc: 'Probabilistic projections across asset classes with explainable scenario weights.',     tag: 'Modeled' },
  { icon: Brain,      title: 'Market Intelligence',  desc: 'Live signals from 40+ venues, distilled by editors into a 5-minute morning read.',         tag: 'Daily' },
  { icon: Shield,     title: 'Risk Assessment',      desc: 'VaR, stress tests, scenario shocks and exposure decomposition for any mandate size.',     tag: 'Console' },
  { icon: Target,     title: 'Portfolio Optimisation', desc: 'Allocation frameworks that respect liquidity, mandate and real-rate sensitivity.',      tag: 'Strategy' },
  { icon: Zap,        title: 'Business Analytics',   desc: 'Operational insights for treasuries: cash, FX, hedging, working-capital exposure.',        tag: 'Treasury' },
  { icon: PieChart,   title: 'AI Insights',          desc: 'A research co-pilot trained on three decades of macroeconomic and metals literature.',     tag: 'Co-pilot' },
];

export default function Services() {
  return (
    <section id="solutions" className="hairline-b" data-testid="services-section">
      {/* Section header */}
      <div className="px-6 lg:px-10 py-16 lg:py-20 grid grid-cols-12 gap-6 hairline-b">
        <div className="col-span-12 lg:col-span-4">
          <div className="label-mono text-ash mb-3">— 002 · Services</div>
          <h2 className="display text-[44px] lg:text-[64px]">
            Eight desks.<br/>One <em>standard</em>.
          </h2>
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex items-end">
          <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6]">
            Each service is operated by named editors and powered by an internal model stack.
            Output is signed, dated, and traceable to source — the way research used to be.
          </p>
        </div>
      </div>

      {/* Editorial grid with hairlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => (
          <motion.a
            key={s.title}
            href="#"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
            className={`group relative bg-bone p-8 lg:p-10 hairline-r hairline-b last:hairline-r-0 hover:bg-bone-deep transition-colors ${
              i >= 4 ? 'lg:hairline-b-0' : ''
            }`}
            data-testid={`service-card-${i}`}
          >
            <div className="flex items-start justify-between mb-10">
              <div className="w-12 h-12 border border-obsidian flex items-center justify-center group-hover:bg-obsidian group-hover:text-bone transition-colors">
                <s.icon size={20} />
              </div>
              <span className="label-mono text-ash">{s.tag}</span>
            </div>

            <h3 className="font-serif text-[26px] leading-tight mb-3 tracking-tight">
              {s.title}
            </h3>
            <p className="text-[14px] text-ash leading-relaxed mb-8">{s.desc}</p>

            <span className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider2 border-b border-obsidian pb-1 group-hover:text-antique-dark group-hover:border-antique-dark transition-colors">
              Read brief <ArrowUpRight size={12} />
            </span>

            {/* Index number, top right corner */}
            <span className="absolute top-3 right-4 font-mono text-[10px] text-ash">
              0{i + 1}
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
