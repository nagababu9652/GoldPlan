'use client';

import { useState } from 'react';
import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { PiggyBank, TrendingUp } from 'lucide-react';

export default function RetirementCorpusPage() {
  const [target, setTarget] = useState('10000000');
  const [years, setYears] = useState('25');
  const [returnRate, setReturnRate] = useState('12');
  const [showResults, setShowResults] = useState(false);

  const fmt = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const calc = () => {
    if (!showResults) return { monthly: 0, total: 0 };
    const F = parseFloat(target);
    const r = parseFloat(returnRate) / 100 / 12;
    const n = parseFloat(years) * 12;
    const monthly = Math.round((F * r) / (Math.pow(1 + r, n) - 1));
    const total = monthly * n;
    return { monthly, total };
  };

  const { monthly, total } = calc();

  return (
    <main className="min-h-screen bg-bone text-obsidian">
      <Navigation />
      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; Tool</div>
              <h1 className="display text-[44px] lg:text-[64px]">Retirement <em>Calculator</em></h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-6 max-w-2xl">Find out how much to save each month to build your ideal retirement corpus.</p>
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-stretch">
            <div className="mb-6 lg:mb-0 flex">
              <div className="flex-1" style={{ padding: '24px', border: '2px solid rgba(92,88,80,0.3)', background: '#F8F6F0' }}>
                <div style={{ border: '1px solid #0C0B0A', padding: '24px', background: '#F8F6F0' }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
                    <div className="w-12 h-12 border border-obsidian flex items-center justify-center"><PiggyBank size={24} /></div>
                    <div><h2 className="font-serif text-[24px] leading-tight">Retirement Goal</h2><p className="text-[13px] text-ash mt-1">Enter your retirement target</p></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div><label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Target Corpus (₹)</label><input type="number" value={target} onChange={e=>setTarget(e.target.value)} className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none" min="100000" step="100000" /></div>
                    <div><label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Time to Retirement (years)</label><input type="number" value={years} onChange={e=>setYears(e.target.value)} className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none" min="1" max="50" step="1" /></div>
                    <div><label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Expected Return (% p.a.)</label><input type="number" value={returnRate} onChange={e=>setReturnRate(e.target.value)} className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none" min="1" max="30" step="0.5" /></div>
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
                      <div className="w-12 h-12 border border-antique flex items-center justify-center text-antique"><TrendingUp size={24} /></div>
                      <div><h2 className="font-serif text-[24px] leading-tight">Your Plan</h2><p className="text-[13px] text-ash mt-1">To reach {fmt(parseFloat(target))}</p></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="border-b border-line" style={{ paddingBottom: '16px' }}>
                        <div className="label-mono text-ash mb-2">Monthly Investment Needed</div>
                        <div className="font-serif text-[40px] leading-none text-antique-dark">{fmt(monthly)}</div>
                        <div className="text-[13px] text-ash mt-2">For {years} years</div>
                      </div>
                      <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                        <div className="border border-line" style={{ padding: '14px' }}><div className="label-mono text-ash mb-2">Total Investment</div><div className="font-serif text-[18px] leading-none">{fmt(total)}</div></div>
                        <div className="border border-line" style={{ padding: '14px' }}><div className="label-mono text-ash mb-2">Gain</div><div className="font-serif text-[18px] leading-none text-emerald-700">{fmt(parseFloat(target) - total)}</div></div>
                      </div>
                      <div className="border border-line" style={{ padding: '14px' }}><div className="label-mono text-ash mb-2">Target Corpus</div><div className="font-serif text-[22px] leading-none">{fmt(parseFloat(target))}</div></div>
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