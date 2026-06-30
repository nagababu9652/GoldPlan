'use client';

import { useState } from 'react';
import Navigation from '@/components/home/Navigation';
import Footer from '@/components/home/Footer';
import { Home, TrendingUp } from 'lucide-react';

export default function EMICalculatorPage() {
  const [loanAmount, setLoanAmount] = useState('5000000');
  const [interestRate, setInterestRate] = useState('9');
  const [tenure, setTenure] = useState('20');
  const [showResults, setShowResults] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  const calcEMI = () => {
    if (!showResults) return { emi: 0, totalInterest: 0, totalPayment: 0 };
    const P = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 100 / 12;
    const n = parseFloat(tenure) * 12;
    const emi = Math.round(P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;
    return { emi, totalInterest, totalPayment };
  };

  const { emi, totalInterest, totalPayment } = calcEMI();

  return (
    <main className="min-h-screen bg-bone text-obsidian">
      <Navigation />
      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-4">&mdash; Tool</div>
              <h1 className="display text-[44px] lg:text-[64px]">EMI <em>Calculator</em></h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-6 max-w-2xl">
                Calculate monthly installments for home, car, or personal loans with a complete amortization overview.
              </p>
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-stretch">
            <div className="mb-6 lg:mb-0 flex">
              <div className="flex-1" style={{ padding: '24px', border: '2px solid rgba(92,88,80,0.3)', background: '#F8F6F0' }}>
                <div style={{ border: '1px solid #0C0B0A', padding: '24px', background: '#F8F6F0' }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
                    <div className="w-12 h-12 border border-obsidian flex items-center justify-center"><Home size={24} /></div>
                    <div>
                      <h2 className="font-serif text-[24px] leading-tight">Loan EMI Calculator</h2>
                      <p className="text-[13px] text-ash mt-1">Enter your loan details</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Loan Amount (₹)</label>
                      <input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)}
                        className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none"
                        min="10000" step="50000" />
                    </div>
                    <div>
                      <label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Interest Rate (% p.a.)</label>
                      <input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)}
                        className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none"
                        min="1" max="30" step="0.25" />
                    </div>
                    <div>
                      <label className="label-mono text-ash block" style={{ marginBottom: '8px' }}>Loan Tenure (years)</label>
                      <input type="number" value={tenure} onChange={e => setTenure(e.target.value)}
                        className="w-full border border-obsidian bg-bone px-4 py-3 text-[15px] focus:border-antique focus:outline-none"
                        min="1" max="40" step="1" />
                    </div>
                    <button onClick={() => setShowResults(true)}
                      className="w-full btn-obsidian justify-center" style={{ padding: '12px 24px' }}>
                      Calculate EMI
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
                        <h2 className="font-serif text-[24px] leading-tight">Your EMI Details</h2>
                        <p className="text-[13px] text-ash mt-1">Based on your inputs</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="border-b border-line" style={{ paddingBottom: '16px' }}>
                        <div className="label-mono text-ash mb-2">Monthly EMI</div>
                        <div className="font-serif text-[40px] leading-none text-antique-dark">{formatCurrency(emi)}</div>
                        <div className="text-[13px] text-ash mt-2">For {tenure} years ({parseFloat(tenure) * 12} months)</div>
                      </div>
                      <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                        <div className="border border-line" style={{ padding: '14px' }}>
                          <div className="label-mono text-ash mb-2">Total Payment</div>
                          <div className="font-serif text-[18px] leading-none">{formatCurrency(totalPayment)}</div>
                        </div>
                        <div className="border border-line" style={{ padding: '14px' }}>
                          <div className="label-mono text-ash mb-2">Total Interest</div>
                          <div className="font-serif text-[18px] leading-none text-red-700">{formatCurrency(totalInterest)}</div>
                        </div>
                      </div>
                      <div className="border border-line" style={{ padding: '14px' }}>
                        <div className="label-mono text-ash mb-2">Loan Amount</div>
                        <div className="font-serif text-[22px] leading-none">{formatCurrency(parseFloat(loanAmount))}</div>
                        <div className="text-[12px] text-ash mt-2">Interest is {((totalInterest / parseFloat(loanAmount)) * 100).toFixed(1)}% of principal</div>
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