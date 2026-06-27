'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';

const tickers = [
  { sym: 'XAU/USD', val: '2,048.50', chg: '+0.42%', dir: 'up' },
  { sym: 'XAG/USD', val: '24.12',    chg: '−0.18%', dir: 'down' },
  { sym: 'XPT/USD', val: '912.40',   chg: '+0.91%', dir: 'up' },
  { sym: 'XPD/USD', val: '1,028.10', chg: '−0.34%', dir: 'down' },
  { sym: 'DXY',     val: '103.42',   chg: '−0.07%', dir: 'down' },
  { sym: 'US10Y',   val: '4.218%',   chg: '+0.03%', dir: 'up' },
  { sym: 'XAU/EUR', val: '1,891.20', chg: '+0.28%', dir: 'up' },
  { sym: 'BTC/USD', val: '64,210',   chg: '+1.84%', dir: 'up' },
];

export default function Hero() {
  return (
    <section className="relative pt-32 lg:pt-36 pb-0" data-testid="hero-section">
      {/* Editorial top strip */}
      <div className="px-6 lg:px-10 pb-6 flex items-center justify-between border-b border-line">
        <div className="label-mono text-ash">Vol. XII · No. 04 · January 2026</div>
        <div className="label-mono text-ash hidden md:block">A Field Report on Gold &amp; Capital</div>
        <div className="label-mono text-antique-dark">Issue · Q1 Outlook</div>
      </div>

      {/* Headline grid */}
      <div className="px-6 lg:px-10 pt-12 lg:pt-20 pb-16 lg:pb-24 grid grid-cols-12 gap-x-6 gap-y-10">
        {/* Eyebrow */}
        <div className="col-span-12 lg:col-span-3 order-1">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
            data-testid="hero-eyebrow"
          >
            <div className="label-mono text-ash">Lead · Editorial</div>
            <div className="text-ash text-[14px] leading-relaxed border-l border-line pl-4">
              An AI-assisted research desk for allocators who think in <span className="text-obsidian">decades</span>, not quarters. Built in London. Trusted on six continents.
            </div>
          </motion.div>
        </div>

        {/* Massive headline */}
        <div className="col-span-12 lg:col-span-9 order-2">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="display text-[56px] sm:text-[80px] lg:text-[112px] xl:text-[128px]"
            data-testid="hero-headline"
          >
            Smarter <em>gold</em> planning<br/>
            for smarter <em>businesses</em>.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 grid grid-cols-12 gap-6"
          >
            <p className="col-span-12 lg:col-span-7 text-[17px] lg:text-[19px] leading-[1.55] text-ash">
              GoldPlan&nbsp;AI is a research desk delivered as software. Institutional reports,
              forecasting, scenario risk and live market intelligence — assembled by editors,
              powered by models, accountable to your mandate.
            </p>

            <div className="col-span-12 lg:col-span-5 flex flex-col gap-3 lg:items-end">
              <div className="flex flex-wrap gap-3">
                <a href="#" className="btn-obsidian" data-testid="hero-cta-demo">
                  Request Demo <ArrowRight size={16} />
                </a>
                <a href="#reports" className="btn-outline" data-testid="hero-cta-sample">
                  Read Sample Report <ArrowDownRight size={16} />
                </a>
              </div>
              <div className="label-mono text-ash">No card · 14-day institutional trial</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Live ticker strip */}
      <div className="bg-obsidian text-bone py-4 border-y border-obsidian overflow-hidden">
        <div className="flex items-center gap-6 px-6 lg:px-10">
          <div className="label-mono text-bone/60 shrink-0 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-antique rounded-full live-dot" />
            Live Tape
          </div>
          <div className="overflow-hidden marquee-mask flex-1">
            <div className="ticker-track flex gap-12 whitespace-nowrap">
              {[...tickers, ...tickers].map((t, i) => (
                <span key={i} className="font-mono text-[13px] flex items-center gap-3">
                  <span className="text-bone/60">{t.sym}</span>
                  <span className="text-bone">{t.val}</span>
                  <span className={t.dir === 'up' ? 'text-emerald-400' : 'text-red-400'}>
                    {t.chg}
                  </span>
                  <span className="text-bone/20">·</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bento grid below ticker */}
      <div className="px-6 lg:px-10 py-16 lg:py-20 grid grid-cols-12 gap-px bg-line hairline-b" data-testid="hero-bento">
        {/* Big stat card */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="col-span-12 lg:col-span-5 bg-bone p-8 lg:p-10"
        >
          <div className="label-mono text-ash mb-6">Live · XAU/USD</div>
          <div className="font-serif text-[88px] lg:text-[120px] leading-none tracking-tightest">
            $2,048<span className="text-antique-dark">.50</span>
          </div>
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-line">
            <div className="flex items-center gap-2 text-emerald-700 font-medium">
              <TrendingUp size={18} /> +0.42% today
            </div>
            <div className="font-mono text-[12px] text-ash">52w high 2,089.20 · low 1,810.40</div>
          </div>
        </motion.div>

        {/* Editorial paragraph card */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="col-span-12 lg:col-span-4 bg-bone-deep p-8 lg:p-10 flex flex-col justify-between"
        >
          <div>
            <div className="label-mono text-ash mb-4">From the Editor's Desk</div>
            <p className="font-serif text-[24px] lg:text-[28px] leading-[1.25] tracking-tight">
              &ldquo;The bullion bull market is no longer a forecast. It is a <em className="text-antique-dark">condition</em> — and conditions require frameworks.&rdquo;
            </p>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-obsidian text-bone flex items-center justify-center font-serif text-[18px]">A</div>
            <div>
              <div className="text-[14px] font-medium">Amara Sokolov</div>
              <div className="font-mono text-[11px] uppercase tracking-wider2 text-ash">Chief Economist</div>
            </div>
          </div>
        </motion.div>

        {/* Stats column */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="col-span-12 lg:col-span-3 bg-bone divide-y divide-line"
        >
          {[
            { l: 'Institutional Clients', v: '500+' },
            { l: 'Assets Analysed',       v: '$2.5B' },
            { l: 'Model Accuracy',        v: '99.9%' },
            { l: 'Reports Published',     v: '12,400' },
          ].map((s) => (
            <div key={s.l} className="p-6 lg:p-7 flex items-baseline justify-between">
              <span className="label-mono text-ash">{s.l}</span>
              <span className="font-serif text-[28px] lg:text-[34px] leading-none">{s.v}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
