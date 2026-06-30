'use client';

import { useState } from 'react';
import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { Calculator, TrendingUp } from 'lucide-react';

export default function XIRRCalculatorPage() {
  const [investment, setInvestment] = useState('100000');
  const [finalValue, setFinalValue] = useState('250000');
  const [years, setYears] = useState('5');
  const [showResults, setShowResults] = useState(false);

  const fmt = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  // Newton-Raphson approximation for XIRR
  const calcXIRR = () => {
    if (!showResults) return 0;
    const P = parseFloat(investment);
    const F = parseFloat(finalValue);
    const n = parseFloat(years);
    let rate = 0.1;
    for (let i = 0; i < 100; i++) {
      const f = P * Math.pow(1 + rate, n) - F;
      const df = n * P * Math.pow(1 + rate, n - 1);
      rate = rate - f / df;
    }
    return rate * 100;
  };

  const xirr = calcXIRR();
  const totalReturns = parseFloat(finalValue) - parseFloat(investment);

  return (
    <main className="min-h-screen bg-bone text-obsidian">
      <Navigation />
      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; Tool</div>
              <h1 className="display text-[44px] lg:text-[64px]">XIRR <em>Calculator</em></h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-6 max-w-2xl">Calculate accurate returns for lump sum investments. XIRR accounts for the timing of cash flows.</p>
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-stretch">
            <div className="mb-6 lg:mb-0 flex">
              <div className="flex-1" style={{ padding: '24px', border: '2px solid rgba(92,88,80,0.3)', background: '#F8F6F0' }}>
                <div style={{ border: '1px solid #0C0B0A', padding: '24px', background: '#F8F6F0' }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
                    <div className="w-12 h-12 border border-obsidian flex items-center justify-center"><Calculator size={24} /></div>
                    <div><h2 className="font-serif text-[24px] leading-tight">XIRR Calculator</h2><p className="text-[13px] text-ash mt-1">Calculate investment returns</p></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div><label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Total Investment (₹)</label><input type="number" value={investment} onChange={e=>setInvestment(e.target.value)} className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none" min="1000" step="1000" /></div>
                    <div><label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Final Value (₹)</label><input type="number" value={finalValue} onChange={e=>setFinalValue(e.target.value)} className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none" min="1000" step="1000" /></div>
                    <div><label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Investment Period (years)</label><input type="number" value={years} onChange={e=>setYears(e.target.value)} className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none" min="1" max="50" step="1" /></div>
                    <button onClick={()=>setShowResults(true)} className="w-full btn-obsidian justify-center" style={{ padding: '12px 24px' }}>Calculate XIRR</button>
                  </div>
                </div>
              </div>
            </div>
            {showResults && (
              <div className="flex">
                <div className="flex-1" style={{ padding: '24px', border: '2px solid rgba(92,88,80,0.3)', background: '#F8F6F0' }}>
                  <div style={{ border: '1px solid #0C0B0A', padding: '24px', background: '#EFECE4' }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
                      <div className="w-12 h-12 border border-antique flex items-center justify-center text-antique"><TrendingUp size={24} /></div>
                      <div><h2 className="font-serif text-[24px] leading-tight">Your Returns</h2><p className="text-[13px] text-ash mt-1">Based on your inputs</p></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="border-b border-line" style={{ paddingBottom: '16px' }}>
                        <div className="label-mono text-ash mb-2">XIRR</div>
                        <div className="font-serif text-[40px] leading-none text-antique-dark">{xirr.toFixed(2)}%</div>
                        <div className="text-[13px] text-ash mt-2">Annualized return over {years} years</div>
                      </div>
                      <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                        <div className="border border-line" style={{ padding: '14px' }}><div className="label-mono text-ash mb-2">Total Investment</div><div className="font-serif text-[18px] leading-none">{fmt(parseFloat(investment))}</div></div>
                        <div className="border border-line" style={{ padding: '14px' }}><div className="label-mono text-ash mb-2">Total Returns</div><div className="font-serif text-[18px] leading-none text-emerald-700">{fmt(totalReturns)}</div></div>
                      </div>
                      <div className="border border-line" style={{ padding: '14px' }}><div className="label-mono text-ash mb-2">Final Value</div><div className="font-serif text-[22px] leading-none">{fmt(parseFloat(finalValue))}</div></div>
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