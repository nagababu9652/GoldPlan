'use client';

import { useState, useMemo } from 'react';
import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { TrendingUp, DollarSign } from 'lucide-react';

export default function LumpsumPlusSIPPage() {
  const [lumpsum, setLumpsum] = useState('500000');
  const [monthlySIP, setMonthlySIP] = useState('10000');
  const [returnRate, setReturnRate] = useState('12');
  const [years, setYears] = useState('10');
  const [showResults, setShowResults] = useState(false);

  const fmt = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const results = useMemo(() => {
    if (!showResults) return null;
    const P = parseFloat(lumpsum);
    const SIP = parseFloat(monthlySIP);
    const r = parseFloat(returnRate) / 100 / 12;
    const n = parseFloat(years) * 12;

    // Lumpsum future value
    const lumpsumFV = Math.round(P * Math.pow(1 + parseFloat(returnRate) / 100, parseFloat(years)));
    
    // SIP future value: FV = SIP * ((1 + r)^n - 1) / r * (1 + r)
    const sipFV = Math.round(SIP * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    
    const totalInvestment = P + (SIP * n);
    const totalFV = lumpsumFV + sipFV;
    const totalReturns = totalFV - totalInvestment;

    return {
      lumpsumFV,
      sipFV,
      totalFV,
      totalInvestment,
      totalReturns,
    };
  }, [showResults, lumpsum, monthlySIP, returnRate, years]);

  return (
    <main className="min-h-screen bg-bone text-obsidian">
      <Navigation />
      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; Tool</div>
              <h1 className="display text-[44px] lg:text-[64px]">Lumpsum + SIP <em>Calculator</em></h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-6 max-w-2xl">
                Combine a one-time lumpsum investment with monthly SIP contributions to maximize your wealth creation.
              </p>
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-stretch">
            <div className="mb-6 lg:mb-0 flex">
              <div className="flex-1" style={{ padding: '24px', border: '2px solid rgba(92,88,80,0.3)', background: '#F8F6F0' }}>
                <div style={{ border: '1px solid #0C0B0A', padding: '24px', background: '#F8F6F0' }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
                    <div className="w-12 h-12 border border-obsidian flex items-center justify-center"><DollarSign size={24} /></div>
                    <div>
                      <h2 className="font-serif text-[24px] leading-tight">Combined Investment</h2>
                      <p className="text-[13px] text-ash mt-1">Enter lumpsum + SIP details</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Lumpsum Investment (₹)</label>
                      <input type="number" value={lumpsum} onChange={e => setLumpsum(e.target.value)}
                        className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none"
                        min="0" step="10000" />
                    </div>
                    <div>
                      <label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Monthly SIP (₹)</label>
                      <input type="number" value={monthlySIP} onChange={e => setMonthlySIP(e.target.value)}
                        className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none"
                        min="500" step="500" />
                    </div>
                    <div>
                      <label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Expected Return (% p.a.)</label>
                      <input type="number" value={returnRate} onChange={e => setReturnRate(e.target.value)}
                        className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none"
                        min="1" max="30" step="0.5" />
                    </div>
                    <div>
                      <label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Time Period (years)</label>
                      <input type="number" value={years} onChange={e => setYears(e.target.value)}
                        className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none"
                        min="1" max="40" step="1" />
                    </div>
                    <button onClick={() => setShowResults(true)}
                      className="w-full btn-obsidian justify-center" style={{ padding: '12px 24px' }}>
                      Calculate Combined Returns
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {results && (
              <div className="flex">
                <div className="flex-1" style={{ padding: '24px', border: '2px solid rgba(92,88,80,0.3)', background: '#F8F6F0' }}>
                  <div style={{ border: '1px solid #0C0B0A', padding: '24px', background: '#EFECE4' }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
                      <div className="w-12 h-12 border border-antique flex items-center justify-center text-antique"><TrendingUp size={24} /></div>
                      <div>
                        <h2 className="font-serif text-[24px] leading-tight">Combined Corpus</h2>
                        <p className="text-[13px] text-ash mt-1">After {years} years</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="border-b border-line" style={{ paddingBottom: '16px' }}>
                        <div className="label-mono text-ash mb-2">Total Future Value</div>
                        <div className="font-serif text-[40px] leading-none text-antique-dark">{fmt(results.totalFV)}</div>
                        <div className="text-[13px] text-ash mt-2">Lumpsum + SIP combined</div>
                      </div>
                      <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                        <div className="border border-line" style={{ padding: '14px' }}>
                          <div className="label-mono text-ash mb-2">Lumpsum Grown To</div>
                          <div className="font-serif text-[16px] leading-none">{fmt(results.lumpsumFV)}</div>
                        </div>
                        <div className="border border-line" style={{ padding: '14px' }}>
                          <div className="label-mono text-ash mb-2">SIP Grown To</div>
                          <div className="font-serif text-[16px] leading-none text-emerald-700">{fmt(results.sipFV)}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                        <div className="border border-line" style={{ padding: '14px' }}>
                          <div className="label-mono text-ash mb-2">Total Investment</div>
                          <div className="font-serif text-[18px] leading-none">{fmt(results.totalInvestment)}</div>
                        </div>
                        <div className="border border-line" style={{ padding: '14px' }}>
                          <div className="label-mono text-ash mb-2">Total Returns</div>
                          <div className="font-serif text-[18px] leading-none text-emerald-700">{fmt(results.totalReturns)}</div>
                        </div>
                      </div>
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