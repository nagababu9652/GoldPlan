'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function DashboardPreview() {
  return (
    <section id="dashboard" className="hairline-b" data-testid="dashboard-section">
      {/* Header */}
      <div className="px-6 lg:px-10 py-16 lg:py-20 grid grid-cols-12 gap-6 hairline-b">
        <div className="col-span-12 lg:col-span-5">
          <div className="label-mono text-ash mb-3">&mdash; 004 &middot; Console</div>
          <h2 className="display text-[44px] lg:text-[64px]">
            One view.<br/>Every <em>goal</em>.
          </h2>
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex items-end">
          <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6]">
            Live portfolio tracker, goal progress, SIP performance and tax overview &mdash; composed
            like a financial newspaper, not a generic fintech dashboard.
          </p>
        </div>
      </div>

      {/* Mock console */}
      <div className="px-6 lg:px-10 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="border border-obsidian bg-bone"
        >
          {/* Console header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-obsidian bg-obsidian text-bone">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider2">
              <span className="w-1.5 h-1.5 bg-antique rounded-full live-dot" />
              app.finplan.in / dashboard
            </div>
            <div className="font-mono text-[11px] uppercase tracking-wider2 text-bone/60">
              Session &middot; IST 10:32 AM
            </div>
          </div>

          {/* Top KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-line">
            {[
              { l: 'Nifty 50',     v: '24,891', d: '+1.2%',   pos: true },
              { l: 'My Portfolio',    v: '\u20B9 48.2L',     d: 'Across 12 funds',  pos: true },
              { l: 'Monthly SIP',     v: '\u20B9 85K', d: '+5% this year',   pos: true },
              { l: 'Goals Tracked',     v: '4/6',     d: 'On track', pos: true },
            ].map((k, i) => (
              <div key={k.l} className={`p-6 lg:p-7 ${i < 3 ? 'border-r border-line' : ''} ${i >= 2 ? 'border-t lg:border-t-0 border-line' : ''}`}>
                <div className="label-mono text-ash mb-3">{k.l}</div>
                <div className="font-serif text-[34px] lg:text-[40px] leading-none tracking-tight">{k.v}</div>
                <div className={`mt-3 font-mono text-[12px] ${k.pos ? 'text-emerald-700' : 'text-ash'}`}>{k.d}</div>
              </div>
            ))}
          </div>

          {/* Chart + Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 border-b border-line">
            <div className="lg:col-span-2 p-6 lg:p-8 lg:border-r border-line">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="label-mono text-ash">Goal Progress &middot; 12 months</div>
                  <div className="font-serif text-[22px] mt-1">Retirement Corpus</div>
                </div>
                <div className="flex gap-1 font-mono text-[11px]">
                  {['1M','3M','6M','1Y'].map((t, i) => (
                    <span key={t} className={`px-2.5 py-1 border ${i === 3 ? 'bg-obsidian text-bone border-obsidian' : 'border-line text-ash'} cursor-pointer hover:bg-obsidian hover:text-bone transition-colors`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              {/* Chart bars */}
              <div className="h-[180px] flex items-end gap-1.5" data-testid="chart-bars">
                {[35, 42, 38, 48, 45, 52, 50, 58, 55, 62, 60, 68].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.06 }}
                    className="flex-1 bg-obsidian/80 hover:bg-antique transition-colors relative group cursor-pointer"
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[10px] text-ash opacity-0 group-hover:opacity-100 transition-opacity">{h}%</span>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-3 font-mono text-[10px] text-ash uppercase tracking-wider2">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>

            {/* Allocation */}
            <div className="p-6 lg:p-8">
              <div className="label-mono text-ash mb-6">Allocation</div>
              <div className="space-y-5">
                {[
                  { l: 'Equity Mutual Funds', v: '55%', c: '#0C0B0A' },
                  { l: 'Debt & FDs',    v: '22%', c: '#B48E4B' },
                  { l: 'PPF / EPF',  v: '13%', c: '#5C5850' },
                  { l: 'NPS', v: '10%', c: '#9E7B35' },
                ].map((a) => (
                  <div key={a.l} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 shrink-0" style={{ background: a.c }} />
                    <div className="flex-1 text-[13px]">{a.l}</div>
                    <div className="font-mono text-[13px]">{a.v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-line">
                <div className="label-mono text-ash mb-1">Total Invested</div>
                <div className="font-serif text-[28px] leading-none">&u20B948,23,450</div>
                <div className="font-mono text-[11px] text-emerald-700 mt-2">+12.3% since inception</div>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div>
            <div className="px-6 lg:px-8 py-4 border-b border-line flex items-center justify-between">
              <div className="label-mono text-ash">Recent Transactions</div>
              <a href="#" className="text-[12px] font-mono uppercase tracking-wider2 u-link">View all</a>
            </div>
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-line text-ash font-mono text-[11px] uppercase tracking-wider2">
                  <th className="text-left px-6 lg:px-8 py-3 font-normal">Fund</th>
                  <th className="text-left px-6 py-3 font-normal">Type</th>
                  <th className="text-right px-6 py-3 font-normal">Amount</th>
                  <th className="text-right px-6 py-3 font-normal">NAV</th>
                  <th className="text-right px-6 lg:px-8 py-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { a: 'SBI Bluechip Fund',         t: 'SIP',  amt: '₹ 25,000',  nav: '₹ 68.42', st: 'Processed' },
                  { a: 'HDFC Mid-Cap Opportunities', t: 'SIP',  amt: '₹ 15,000',  nav: '₹ 112.50', st: 'Processed' },
                  { a: 'ICICI Pru Equity & Debt',    t: 'Lumpsum', amt: '₹ 1,00,000', nav: '₹ 89.75', st: 'Pending' },
                  { a: 'Kotak Flexi Cap Fund',         t: 'SIP',  amt: '₹ 10,000',  nav: '₹ 45.30', st: 'Processed' },
                ].map((r, i) => (
                  <tr key={i} className="border-b border-line last:border-b-0 hover:bg-bone-deep transition-colors">
                    <td className="px-6 lg:px-8 py-4 font-medium">{r.a}</td>
                    <td className="px-6 py-4">
                      <span className={`font-mono text-[11px] uppercase tracking-wider2 px-2 py-1 border ${r.t === 'SIP' ? 'border-emerald-700 text-emerald-700' : 'border-antique-dark text-antique-dark'}`}>
                        {r.t}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">{r.amt}</td>
                    <td className="px-6 py-4 text-right font-mono text-ash">{r.nav}</td>
                    <td className="px-6 lg:px-8 py-4 text-right font-mono text-[11px] uppercase tracking-wider2 text-ash">{r.st}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-ash text-[14px] max-w-xl">
            Console preview &middot; Your actual dashboard includes SIP calendar, tax harvest alerts,
            goal rebalancing suggestions, and advisor notes.
          </p>
          <a href="#" className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-wider2 u-link">
            Explore dashboard <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
