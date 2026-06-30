'use client';

import { useState } from 'react';
import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function StepUpSIPPage() {
  const [monthly, setMonthly] = useState('10000');
  const [annualIncrease, setAnnualIncrease] = useState('10');
  const [returnRate, setReturnRate] = useState('12');
  const [years, setYears] = useState('10');
  const [showResults, setShowResults] = useState(false);

  const fmt = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const calc = () => {
    if (!showResults) return { fv: 0, totalInv: 0, totalRet: 0 };
    const P = parseFloat(monthly);
    const step = parseFloat(annualIncrease) / 100;
    const r = parseFloat(returnRate) / 100 / 12;
    const n = parseFloat(years) * 12;
    let fv = 0, totalInv = 0;
    let currentSIP = P;
    for (let y = 0; y < parseFloat(years); y++) {
      for (let m = 0; m < 12; m++) {
        fv = (fv + currentSIP) * (1 + r);
        totalInv += currentSIP;
      }
      currentSIP *= (1 + step);
    }
    return { fv: Math.round(fv), totalInv, totalRet: Math.round(fv - totalInv) };
  };

  const { fv, totalInv, totalRet } = calc();

  return (
    <main className="min-h-screen bg-bone text-obsidian">
      <Navigation />
      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; Tool</div>
              <h1 className="display text-[44px] lg:text-[64px]">Step-Up SIP <em>Calculator</em></h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-6 max-w-2xl">Plan your SIP with annual increases to beat inflation and build wealth faster.</p>
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-stretch">
            <div className="mb-6 lg:mb-0 flex">
              <div className="flex-1" style={{ padding: '24px', border: '2px solid rgba(92,88,80,0.3)', background: '#F8F6F0' }}>
                <div style={{ border: '1px solid #0C0B0A', padding: '24px', background: '#F8F6F0' }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
                    <div className="w-12 h-12 border border-obsidian flex items-center justify-center"><BarChart3 size={24} /></div>
                    <div><h2 className="font-serif text-[24px] leading-tight">Step-Up SIP</h2><p className="text-[13px] text-ash mt-1">Enter your investment details</p></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div><label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Monthly SIP (₹)</label><input type="number" value={monthly} onChange={e=>setMonthly(e.target.value)} className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none" min="500" step="500" /></div>
                    <div><label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Annual Increase (%)</label><input type="number" value={annualIncrease} onChange={e=>setAnnualIncrease(e.target.value)} className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none" min="0" max="50" step="1" /></div>
                    <div><label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Expected Return (% p.a.)</label><input type="number" value={returnRate} onChange={e=>setReturnRate(e.target.value)} className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none" min="1" max="30" step="0.5" /></div>
                    <div><label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Time Period (years)</label><input type="number" value={years} onChange={e=>setYears(e.target.value)} className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none" min="1" max="40" step="1" /></div>
                    <button onClick={()=>setShowResults(true)} className="w-full btn-obsidian justify-center" style={{ padding: '12px 24px' }}>Calculate Returns</button>
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
                      <div><h2 className="font-serif text-[24px] leading-tight">Your Returns</h2><p className="text-[13px] text-ash mt-1">With annual step-up of {annualIncrease}%</p></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="border-b border-line" style={{ paddingBottom: '16px' }}>
                        <div className="label-mono text-ash mb-2">Future Value</div>
                        <div className="font-serif text-[40px] leading-none text-antique-dark">{fmt(fv)}</div>
                        <div className="text-[13px] text-ash mt-2">Value after {years} years</div>
                      </div>
                      <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                        <div className="border border-line" style={{ padding: '14px' }}><div className="label-mono text-ash mb-2">Total Investment</div><div className="font-serif text-[18px] leading-none">{fmt(totalInv)}</div></div>
                        <div className="border border-line" style={{ padding: '14px' }}><div className="label-mono text-ash mb-2">Total Returns</div><div className="font-serif text-[18px] leading-none text-emerald-700">{fmt(totalRet)}</div></div>
                      </div>
                      <div className="border border-line" style={{ padding: '14px' }}><div className="label-mono text-ash mb-2">Returns Percentage</div><div className="flex items-baseline gap-2"><span className="font-serif text-[24px] leading-none text-emerald-700">{((totalRet / totalInv) * 100).toFixed(1)}</span><span className="text-[16px] text-ash">%</span></div></div>
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