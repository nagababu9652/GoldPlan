'use client';

import { useState } from 'react';
import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { DollarSign, TrendingUp } from 'lucide-react';

export default function LumpsumCalculatorPage() {
  const [investment, setInvestment] = useState('100000');
  const [returnRate, setReturnRate] = useState('12');
  const [timePeriod, setTimePeriod] = useState('10');
  const [showResults, setShowResults] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  const futureValue = showResults
    ? Math.round(parseFloat(investment) * Math.pow(1 + parseFloat(returnRate) / 100, parseFloat(timePeriod)))
    : 0;
  const totalReturns = futureValue - parseFloat(investment);

  return (
    <main className="min-h-screen bg-bone text-obsidian">
      <Navigation />
      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; Tool</div>
              <h1 className="display text-[44px] lg:text-[64px]">Lumpsum <em>Calculator</em></h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-6 max-w-2xl">
                Calculate the future value of a one-time lump sum investment with compound interest.
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
                      <h2 className="font-serif text-[24px] leading-tight">One-Time Investment</h2>
                      <p className="text-[13px] text-ash mt-1">Enter your investment details</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Lumpsum Investment (₹)</label>
                      <input type="number" value={investment} onChange={e => setInvestment(e.target.value)}
                        className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none"
                        min="1000" step="1000" />
                    </div>
                    <div>
                      <label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Expected Return Rate (% p.a.)</label>
                      <input type="number" value={returnRate} onChange={e => setReturnRate(e.target.value)}
                        className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none"
                        min="1" max="30" step="0.5" />
                    </div>
                    <div>
                      <label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Time Period (years)</label>
                      <input type="number" value={timePeriod} onChange={e => setTimePeriod(e.target.value)}
                        className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none"
                        min="1" max="40" step="1" />
                    </div>
                    <button onClick={() => setShowResults(true)}
                      className="w-full btn-obsidian justify-center" style={{ padding: '12px 24px' }}>
                      Calculate Returns
                    </button>
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
                      <div>
                        <h2 className="font-serif text-[24px] leading-tight">Your Returns</h2>
                        <p className="text-[13px] text-ash mt-1">Based on your inputs</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="border-b border-line" style={{ paddingBottom: '16px' }}>
                        <div className="label-mono text-ash mb-2">Future Value</div>
                        <div className="font-serif text-[40px] leading-none text-antique-dark">{formatCurrency(futureValue)}</div>
                        <div className="text-[13px] text-ash mt-2">Value after {timePeriod} years</div>
                      </div>
                      <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                        <div className="border border-line" style={{ padding: '14px' }}>
                          <div className="label-mono text-ash mb-2">Total Investment</div>
                          <div className="font-serif text-[18px] leading-none">{formatCurrency(parseFloat(investment))}</div>
                        </div>
                        <div className="border border-line" style={{ padding: '14px' }}>
                          <div className="label-mono text-ash mb-2">Total Returns</div>
                          <div className="font-serif text-[18px] leading-none text-emerald-700">{formatCurrency(totalReturns)}</div>
                        </div>
                      </div>
                      <div className="border border-line" style={{ padding: '14px' }}>
                        <div className="label-mono text-ash mb-2">Returns Percentage</div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-[24px] leading-none text-emerald-700">{((totalReturns / parseFloat(investment)) * 100).toFixed(1)}</span>
                          <span className="text-[16px] text-ash">%</span>
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