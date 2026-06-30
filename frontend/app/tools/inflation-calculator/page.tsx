'use client';

import { useState } from 'react';
import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { LineChart, TrendingDown } from 'lucide-react';

export default function InflationCalculatorPage() {
  const [amount, setAmount] = useState('100000');
  const [inflationRate, setInflationRate] = useState('6');
  const [years, setYears] = useState('10');
  const [showResults, setShowResults] = useState(false);

  const fmt = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const futureValue = showResults
    ? Math.round(parseFloat(amount) / Math.pow(1 + parseFloat(inflationRate) / 100, parseFloat(years)))
    : 0;
  const lostValue = parseFloat(amount) - futureValue;

  return (
    <main className="min-h-screen bg-bone text-obsidian">
      <Navigation />
      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; Tool</div>
              <h1 className="display text-[44px] lg:text-[64px]">Inflation <em>Calculator</em></h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-6 max-w-2xl">See how inflation erodes your purchasing power over time.</p>
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-stretch">
            <div className="mb-6 lg:mb-0 flex">
              <div className="flex-1" style={{ padding: '24px', border: '2px solid rgba(92,88,80,0.3)', background: '#F8F6F0' }}>
                <div style={{ border: '1px solid #0C0B0A', padding: '24px', background: '#F8F6F0' }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
                    <div className="w-12 h-12 border border-obsidian flex items-center justify-center"><LineChart size={24} /></div>
                    <div><h2 className="font-serif text-[24px] leading-tight">Inflation Impact</h2><p className="text-[13px] text-ash mt-1">See the effect of inflation</p></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div><label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Today's Value (₹)</label><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none" min="1000" step="1000" /></div>
                    <div><label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Inflation Rate (%)</label><input type="number" value={inflationRate} onChange={e=>setInflationRate(e.target.value)} className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none" min="1" max="30" step="0.5" /></div>
                    <div><label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Time Period (years)</label><input type="number" value={years} onChange={e=>setYears(e.target.value)} className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none" min="1" max="50" step="1" /></div>
                    <button onClick={()=>setShowResults(true)} className="w-full btn-obsidian justify-center" style={{ padding: '12px 24px' }}>Calculate</button>
                  </div>
                </div>
              </div>
            </div>
            {showResults && (
              <div className="flex">
                <div className="flex-1" style={{ padding: '24px', border: '2px solid rgba(92,88,80,0.3)', background: '#F8F6F0' }}>
                  <div style={{ border: '1px solid #0C0B0A', padding: '24px', background: '#EFECE4' }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
                      <div className="w-12 h-12 border border-antique flex items-center justify-center text-antique"><TrendingDown size={24} /></div>
                      <div><h2 className="font-serif text-[24px] leading-tight">Inflation Impact</h2></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="border-b border-line" style={{ paddingBottom: '16px' }}>
                        <div className="label-mono text-ash mb-2">Future Value (Purchasing Power)</div>
                        <div className="font-serif text-[40px] leading-none text-antique-dark">{fmt(futureValue)}</div>
                        <div className="text-[13px] text-ash mt-2">After {years} years at {inflationRate}% inflation</div>
                      </div>
                      <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                        <div className="border border-line" style={{ padding: '14px' }}><div className="label-mono text-ash mb-2">Today's Value</div><div className="font-serif text-[18px] leading-none">{fmt(parseFloat(amount))}</div></div>
                        <div className="border border-line" style={{ padding: '14px' }}><div className="label-mono text-ash mb-2">Value Lost</div><div className="font-serif text-[18px] leading-none text-red-700">{fmt(lostValue)}</div></div>
                      </div>
                      <div className="border border-line" style={{ padding: '14px' }}><div className="label-mono text-ash mb-2">Purchasing Power Lost</div><div className="flex items-baseline gap-2"><span className="font-serif text-[24px] leading-none text-red-700">{((lostValue / parseFloat(amount)) * 100).toFixed(1)}%</span></div></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}