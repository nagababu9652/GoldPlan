'use client';

import { useState, useMemo } from 'react';
import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import AuthGuard from '@/components/auth/AuthGuard';
import { Calculator, TrendingUp, Info } from 'lucide-react';

export default function SIPCalculatorPage() {
  const [monthlyInvestment, setMonthlyInvestment] = useState('10000');
  const [expectedReturn, setExpectedReturn] = useState('12');
  const [timePeriod, setTimePeriod] = useState('10');
  const [showResults, setShowResults] = useState(false);

  const results = useMemo(() => {
    if (!showResults) return null;
    
    const P = parseFloat(monthlyInvestment);
    const r = parseFloat(expectedReturn) / 100 / 12;
    const n = parseFloat(timePeriod) * 12;

    if (P && r && n) {
      // Future Value of SIP formula: FV = P * ((1 + r)^n - 1) / r * (1 + r)
      const futureValue = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      const totalInvestment = P * n;
      const totalReturns = futureValue - totalInvestment;

      return {
        futureValue: Math.round(futureValue),
        totalInvestment: Math.round(totalInvestment),
        totalReturns: Math.round(totalReturns),
      };
    }
    return null;
  }, [showResults, monthlyInvestment, expectedReturn, timePeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AuthGuard requireAuth={true}>
      <main className="min-h-screen bg-bone text-obsidian" data-testid="sip-calculator-page">
        <Navigation />

      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; 005 &middot; Tools</div>
              <h1 className="display text-[44px] lg:text-[64px]">
                SIP <em>Calculator</em>
              </h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-6 max-w-2xl">
                Plan your investments with our Systematic Investment Plan calculator. 
                Estimate returns and build wealth over time with disciplined investing.
              </p>
            </div>
          </div>

          {/* Form + Results side by side on large screens */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-stretch">
            {/* Calculator Form */}
            <div className="mb-6 lg:mb-0 flex">
              <div className="flex-1" style={{ padding: '24px', border: '2px solid rgba(92,88,80,0.3)', background: '#F8F6F0' }}>
                <div style={{ border: '1px solid #0C0B0A', padding: '24px', background: '#F8F6F0' }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
                    <div className="w-12 h-12 border border-obsidian flex items-center justify-center">
                      <Calculator size={24} />
                    </div>
                    <div>
                      <h2 className="font-serif text-[24px] leading-tight">Calculate Your SIP</h2>
                      <p className="text-[13px] text-ash mt-1">Enter your investment details</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Monthly Investment */}
                    <div>
                      <label htmlFor="monthlyInvestment" className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Monthly Investment (₹)</label>
                      <div>
                        <input
                          id="monthlyInvestment"
                          type="number"
                          value={monthlyInvestment}
                          onChange={(e) => setMonthlyInvestment(e.target.value)}
                          className="w-full border border-obsidian bg-bone text-[15px] focus:border-antique focus:outline-none transition-colors"
                          style={{ padding: '12px 16px' }}
                          placeholder="Enter monthly amount"
                          min="500"
                          step="500"
                        />
                      </div>
                      <p className="text-[11px] text-ash mt-1">Minimum ₹500 per month</p>
                    </div>

                    {/* Expected Return Rate */}
                    <div>
                      <label htmlFor="expectedReturn" className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Expected Return Rate (% per annum)</label>
                      <div>
                        <input
                          id="expectedReturn"
                          type="number"
                          value={expectedReturn}
                          onChange={(e) => setExpectedReturn(e.target.value)}
                          className="w-full border border-obsidian bg-bone text-[15px] focus:border-antique focus:outline-none transition-colors"
                          style={{ padding: '12px 16px' }}
                          placeholder="Enter expected return"
                          min="1"
                          max="30"
                          step="0.5"
                        />
                      </div>
                      <p className="text-[11px] text-ash mt-1">Typical equity returns: 10-15%</p>
                    </div>

                    {/* Time Period */}
                    <div>
                      <label htmlFor="timePeriod" className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Investment Period (years)</label>
                      <div>
                        <input
                          id="timePeriod"
                          type="number"
                          value={timePeriod}
                          onChange={(e) => setTimePeriod(e.target.value)}
                          className="w-full border border-obsidian bg-bone text-[15px] focus:border-antique focus:outline-none transition-colors"
                          style={{ padding: '12px 16px' }}
                          placeholder="Enter time period"
                          min="1"
                          max="40"
                          step="1"
                        />
                      </div>
                      <p className="text-[11px] text-ash mt-1">Longer periods yield better returns</p>
                    </div>

                    {/* Calculate Button */}
                    <button
                      onClick={() => setShowResults(true)}
                      className="w-full btn-obsidian justify-center text-[15px] font-medium"
                      style={{ padding: '12px 24px' }}
                    >
                      Calculate Returns
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            {results && (
              <div className="flex">
                <div className="flex-1" style={{ padding: '24px', border: '2px solid rgba(92,88,80,0.3)', background: '#F8F6F0' }}>
                  <div style={{ border: '1px solid #0C0B0A', padding: '24px', background: '#EFECE4' }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
                      <div className="w-12 h-12 border border-antique flex items-center justify-center text-antique">
                        <TrendingUp size={24} />
                      </div>
                      <div>
                        <h2 className="font-serif text-[24px] leading-tight">Your Returns</h2>
                        <p className="text-[13px] text-ash mt-1">Based on your inputs</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Future Value */}
                      <div className="border-b border-line" style={{ paddingBottom: '16px' }}>
                        <div className="label-mono text-ash mb-2">Future Value</div>
                        <div className="font-serif text-[32px] lg:text-[40px] leading-none text-antique-dark">
                          {formatCurrency(results.futureValue)}
                        </div>
                        <div className="text-[13px] text-ash mt-2">
                          Value after {timePeriod} years
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                        <div className="border border-line" style={{ padding: '14px' }}>
                          <div className="label-mono text-ash mb-2">Total Investment</div>
                          <div className="font-serif text-[18px] leading-none">
                            {formatCurrency(results.totalInvestment)}
                          </div>
                        </div>
                        <div className="border border-line" style={{ padding: '14px' }}>
                          <div className="label-mono text-ash mb-2">Total Returns</div>
                          <div className="font-serif text-[18px] leading-none text-emerald-700">
                            {formatCurrency(results.totalReturns)}
                          </div>
                        </div>
                      </div>

                      {/* Returns Percentage */}
                      <div className="border border-line" style={{ padding: '14px' }}>
                        <div className="label-mono text-ash mb-2">Returns Percentage</div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-[24px] leading-none text-emerald-700">
                            {((results.totalReturns / results.totalInvestment) * 100).toFixed(1)}
                          </span>
                          <span className="text-[16px] text-ash">%</span>
                        </div>
                        <div className="text-[12px] text-ash mt-2">
                          On your total investment of {formatCurrency(results.totalInvestment)}
                        </div>
                      </div>

                      {/* Monthly Breakdown */}
                      <div className="border border-line" style={{ padding: '14px' }}>
                        <div className="label-mono text-ash mb-3">Monthly Breakdown</div>
                        <div className="space-y-2 text-[13px]">
                          <div className="flex justify-between">
                            <span className="text-ash">Monthly SIP</span>
                            <span className="font-medium">{formatCurrency(parseFloat(monthlyInvestment))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ash">Total Months</span>
                            <span className="font-medium">{parseFloat(timePeriod) * 12} months</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ash">Return Rate</span>
                            <span className="font-medium">{expectedReturn}% p.a.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-12 border-t border-line pt-10">
            <h3 className="font-serif text-[28px] leading-tight mb-6">How SIP Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '16px' }}>
              <div className="border border-line" style={{ padding: '20px' }}>
                <div className="label-mono text-ash mb-3">01</div>
                <h4 className="font-serif text-[18px] leading-tight mb-3">Regular Investment</h4>
                <p className="text-[13px] text-ash leading-relaxed">
                  Invest a fixed amount every month in your chosen mutual fund scheme. 
                  Start with as little as ₹500.
                </p>
              </div>
              <div className="border border-line" style={{ padding: '20px' }}>
                <div className="label-mono text-ash mb-3">02</div>
                <h4 className="font-serif text-[18px] leading-tight mb-3">Power of Compounding</h4>
                <p className="text-[13px] text-ash leading-relaxed">
                  Your returns earn returns. Over time, compounding significantly boosts 
                  your wealth creation.
                </p>
              </div>
              <div className="border border-line" style={{ padding: '20px' }}>
                <div className="label-mono text-ash mb-3">03</div>
                <h4 className="font-serif text-[18px] leading-tight mb-3">Rupee Cost Averaging</h4>
                <p className="text-[13px] text-ash leading-relaxed">
                  Buy more units when markets are down and fewer when they're up, 
                  averaging your purchase cost.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
    </AuthGuard>
  );
}
