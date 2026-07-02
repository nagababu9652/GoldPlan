'use client';

import { useState, useEffect } from 'react';
import Navigation from "@/components/home/Navigation";
import Footer from "@/components/home/Footer";
import AuthGuard from "@/components/auth/AuthGuard";
import MarketChart from "@/components/charts/MarketChart";
import { fetchMarketData, type MarketData } from '@/lib/api';

export default function DashboardPage() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchMarketData();
      setMarketData(data);
      setLoading(false);
    };
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthGuard requireAuth={true}>
      <main className="min-h-screen bg-bone text-obsidian " data-testid="dashboard-page">
        <Navigation />

      <div className="page-frame grain">
        <section className="px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-12 gap-6 mb-12">
            <div className="col-span-12 lg:col-span-8">
              <div className="label-mono text-ash mb-3">&mdash; 011 &middot; Dashboard</div>
              <h1 className="display text-[44px] lg:text-[64px]">
                Welcome, <em>Admin</em>.
              </h1>
              <p className="text-ash text-[16px] lg:text-[18px] leading-[1.6] mt-4 max-w-2xl">
                Here&rsquo;s your financial overview. Live market data, historical trends, and AI-powered predictions.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-3 lg:col-start-10 flex items-end">
              <a href="/goals" className="btn-obsidian" data-testid="dashboard-add-goal">
                + Add New Goal
              </a>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line mb-12">
            {[
              { l: 'Total Invested', v: '\u20B948,23,450' },
              { l: 'Current Value', v: '\u20B954,12,800' },
              { l: 'Total Returns', v: loading ? '+12.3%' : (marketData?.nifty50_change_percent ? (marketData.nifty50_change_percent >= 0 ? '+' : '') + marketData.nifty50_change_percent.toFixed(2) + '%' : '+12.3%') },
              { l: 'Active Goals', v: '4/6' },
            ].map((s, i) => (
              <div key={s.l} className={`bg-bone p-6 lg:p-8 ${i < 3 ? 'lg:border-r border-line' : ''}`}>
                <div className="label-mono text-ash mb-2">{s.l}</div>
                <div className="font-serif text-[32px] lg:text-[36px] leading-none">{s.v}</div>
              </div>
            ))}
          </div>

          {/* Market Charts Section */}
          <div className="mb-12">
            <div className="label-mono text-ash mb-6">&mdash; Market Trends & Predictions</div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MarketChart title="NIFTY 50" symbol="NIFTY" color="#0C0B0A" />
              <MarketChart title="SENSEX" symbol="SENSEX" color="#B48E4B" />
              <MarketChart title="GOLD (₹/g)" symbol="GOLD" color="#C9A227" prefix="₹" />
            </div>
          </div>

          {/* Goals section */}
          <div className="mb-12">
            <div className="label-mono text-ash mb-6">&mdash; Your Goals</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
              {[
                { name: 'Retirement', progress: 68, target: '\u20B95 Cr', timeline: '15 years' },
                { name: 'Child Education', progress: 45, target: '\u20B950L', timeline: '8 years' },
                { name: 'Home Purchase', progress: 32, target: '\u20B91.2 Cr', timeline: '5 years' },
                { name: 'Emergency Fund', progress: 85, target: '\u20B910L', timeline: 'Complete' },
              ].map((g, i) => (
                <div key={g.name} className="bg-bone p-6 lg:p-8" data-testid={`goal-card-${i}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-serif text-[22px] leading-tight">{g.name}</div>
                    <span className="label-mono text-ash">{g.timeline}</span>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-[13px] mb-1">
                      <span className="text-ash">Progress</span>
                      <span className="font-mono">{g.progress}%</span>
                    </div>
                    <div className="h-2 bg-line">
                      <div className="h-full bg-obsidian" style={{ width: `${g.progress}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-ash">Target</span>
                    <span className="font-medium">{g.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <div className="label-mono text-ash mb-6">&mdash; Recent Activity</div>
            <div className="border border-obsidian bg-bone">
              <div className="px-6 lg:px-8 py-4 border-b border-line flex justify-between">
                <span className="label-mono text-ash">Latest transactions and updates</span>
                <a href="/dashboard" className="text-[12px] font-mono uppercase tracking-wider2 u-link">View all</a>
              </div>
              <div className="divide-y divide-line">
                {[
                  { fund: 'SBI Bluechip Fund', type: 'SIP', amount: '\u20B925,000', date: 'Today, 10:30 AM', status: 'Processed' },
                  { fund: 'HDFC Mid-Cap Fund', type: 'SIP', amount: '\u20B915,000', date: 'Yesterday, 10:30 AM', status: 'Processed' },
                  { fund: 'ICICI Pru Equity & Debt', type: 'Lumpsum', amount: '\u20B91,00,000', date: '15 Jan 2026', status: 'Pending' },
                ].map((t, i) => (
                  <div key={i} className="px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t.fund}</div>
                      <div className="text-[12px] text-ash font-mono mt-0.5">{t.type} &middot; {t.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{t.amount}</div>
                      <div className="text-[12px] text-emerald-700 font-mono mt-0.5">{t.status}</div>
                    </div>
                  </div>
                ))}
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
