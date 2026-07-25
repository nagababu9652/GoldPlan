'use client';

import { useState, useEffect } from 'react';
import { getAdvisorPortfolio, type AdvisorPortfolio } from '@/lib/api';

export default function AdvisorPortfolioPage() {
  const [data, setData] = useState<AdvisorPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('finplan_token');
    if (!token) return;

    getAdvisorPortfolio(token)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-ash">Loading portfolio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-frame">
      <section className="px-6 lg:px-10 py-8 lg:py-12">
        <div className="mb-10">
          <div className="label-mono text-ash mb-3">&mdash; Portfolio Management</div>
          <h1 className="display text-[36px] lg:text-[48px]">
            Client Portfolios
          </h1>
          <p className="text-ash text-[16px] leading-[1.6] mt-3">
            View and manage investment portfolios for all your clients
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-bone border border-obsidian p-6">
            <div className="label-mono text-ash mb-2">Total AUM</div>
            <div className="font-serif text-[32px]">₹{data?.total_value?.toLocaleString('en-IN')}</div>
            <div className="text-[14px] text-ash mt-1">All clients</div>
          </div>
          <div className="bg-bone border border-obsidian p-6">
            <div className="label-mono text-ash mb-2">Total Investment</div>
            <div className="font-serif text-[32px]">₹{data?.total_cost?.toLocaleString('en-IN')}</div>
            <div className="text-[14px] text-ash mt-1">Across all portfolios</div>
          </div>
          <div className="bg-bone border border-obsidian p-6">
            <div className="label-mono text-ash mb-2">Total Returns</div>
            <div className="font-serif text-[32px] text-emerald-700">+₹{data?.total_returns?.toLocaleString('en-IN')}</div>
            <div className="text-[14px] text-ash mt-1">{data?.returns_percentage}% overall returns</div>
          </div>
        </div>

        {/* Holdings */}
        <div className="border border-obsidian bg-bone">
          <div className="px-6 lg:px-8 py-4 border-b border-line">
            <span className="label-mono text-ash">Aggregated Holdings Across All Clients</span>
          </div>
          <div className="divide-y divide-line">
            {data?.holdings?.map((holding, i) => (
              <div key={i} className="px-6 lg:px-8 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-[15px]">{holding.name}</div>
                  <div className="text-[12px] text-ash font-mono mt-1">
                    {holding.allocation}% of total portfolio
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-[18px]">₹{holding.value?.toLocaleString('en-IN')}</div>
                  <div className={`text-[13px] font-mono ${holding.returns >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {holding.returns >= 0 ? '+' : ''}{holding.returns}% returns
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}