'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function DashboardPreview() {
  return (
    <section id="reports" className="hairline-b" data-testid="dashboard-section">
      {/* Header */}
      <div className="px-6 lg:px-10 py-16 lg:py-20 grid grid-cols-12 gap-6 hairline-b">
        <div className="col-span-12 lg:col-span-5">
          <div className="label-mono text-ash mb-3">— 004 · Console</div>
          <h2 className="display text-[44px] lg:text-[64px]">
            One view.<br/>Every <em>position</em>.
          </h2>
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex items-end">
          <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6]">
            Live spot tape, allocation, scenario risk and a full audit trail — composed like a
            broadsheet, not a dashboard. Built for the way principals actually read.
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
              app.goldplan.ai / desk
            </div>
            <div className="font-mono text-[11px] uppercase tracking-wider2 text-bone/60">
              Session · 14:32 GMT
            </div>
          </div>

          {/* Top KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-line">
            {[
              { l: 'Gold Spot',     v: '$2,048.50', d: '+2.5%',   pos: true },
              { l: 'Market Cap',    v: '$8.2T',     d: 'Global',  pos: false },
              { l: 'Vol · 24h',     v: '$124B',     d: '+8.1%',   pos: true },
              { l: 'Portfolio',     v: '$847K',     d: '+12.3% YTD', pos: true },
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
                  <div className="label-mono text-ash">Gold Price · 12 mo</div>
                  <div className="font-serif text-[22px] mt-1">Spot $/oz</div>
                </div>
                <div className="flex gap-1 font-mono text-[11px]">
                  {['1D','1W','1M','1Y'].map((t, i) => (
                    <span key={t} className={`px-2.5 py-1 border ${i === 3 ? 'bg-obsidian text-bone border-obsidian' : 'border-line text-ash'}`}>{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-end justify-between h-44 gap-1.5">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => {
                  const h = [45, 52, 48, 58, 64, 60, 72, 68, 80, 76, 88, 92][i];
                  return (
                    <div key={m} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        className="w-full bg-obsidian relative"
                      >
                        {i === 11 && <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[10px] text-antique-dark whitespace-nowrap">2,048</span>}
                      </motion.div>
                      <span className="font-mono text-[10px] text-ash">{m}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 lg:p-8 bg-bone-deep">
              <div className="label-mono text-ash mb-5">Allocation</div>
              {[
                { l: 'Gold & Metals', v: 45, c: '#B48E4B' },
                { l: 'Equities',      v: 35, c: '#0C0B0A' },
                { l: 'Fixed Income',  v: 20, c: '#8A857B' },
              ].map((a, i) => (
                <div key={a.l} className={`py-4 ${i < 2 ? 'border-b border-line' : ''}`}>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[14px]">{a.l}</span>
                    <span className="font-serif text-[22px]">{a.v}%</span>
                  </div>
                  <div className="h-[3px] bg-line">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${a.v}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                      className="h-full"
                      style={{ background: a.c }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-6 pt-5 border-t border-line">
                <div className="label-mono text-ash mb-1">Total NAV</div>
                <div className="font-serif text-[28px] leading-none">$847,234</div>
                <div className="font-mono text-[11px] text-emerald-700 mt-2">+12.3% YTD</div>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div>
            <div className="px-6 lg:px-8 py-4 border-b border-line flex items-center justify-between">
              <div className="label-mono text-ash">Recent Tape</div>
              <a href="#" className="text-[12px] font-mono uppercase tracking-wider2 u-link">View all</a>
            </div>
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-line text-ash font-mono text-[11px] uppercase tracking-wider2">
                  <th className="text-left px-6 lg:px-8 py-3 font-normal">Asset</th>
                  <th className="text-left px-6 py-3 font-normal">Type</th>
                  <th className="text-right px-6 py-3 font-normal">Size</th>
                  <th className="text-right px-6 py-3 font-normal">Value</th>
                  <th className="text-right px-6 lg:px-8 py-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { a: 'Gold XAU/USD',    t: 'Buy',  s: '50 oz',         v: '$102,425', st: 'Settled' },
                  { a: 'Silver XAG/USD',  t: 'Buy',  s: '200 oz',        v: '$4,800',   st: 'Settled' },
                  { a: 'Gold Futures',    t: 'Sell', s: '25 contracts',  v: '$51,212',  st: 'Pending' },
                  { a: 'Platinum',        t: 'Buy',  s: '100 oz',        v: '$92,000',  st: 'Settled' },
                ].map((r, i) => (
                  <tr key={i} className="border-b border-line last:border-b-0 hover:bg-bone-deep transition-colors">
                    <td className="px-6 lg:px-8 py-4 font-medium">{r.a}</td>
                    <td className="px-6 py-4">
                      <span className={`font-mono text-[11px] uppercase tracking-wider2 px-2 py-1 border ${r.t === 'Buy' ? 'border-emerald-700 text-emerald-700' : 'border-red-700 text-red-700'}`}>
                        {r.t}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-ash">{r.s}</td>
                    <td className="px-6 py-4 text-right font-medium">{r.v}</td>
                    <td className="px-6 lg:px-8 py-4 text-right font-mono text-[11px] uppercase tracking-wider2 text-ash">{r.st}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-ash text-[14px] max-w-xl">
            Console preview · A simplified rendering. Production view includes live order book,
            scenario simulator and editor commentary.
          </p>
          <a href="#" className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-wider2 u-link">
            Tour the desk <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
