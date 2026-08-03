'use client';

import { useState, useEffect } from 'react';
import { getAdvisorDashboard, type AdvisorDashboard } from '@/lib/api';
import Link from 'next/link';

export default function AdvisorDashboardPage() {
  const [data, setData] = useState<AdvisorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('finplan_token');
    if (!token) {
      setLoading(false);
      setError('Please login to access the advisor dashboard');
      return;
    }

    getAdvisorDashboard(token)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-ash">Loading dashboard...</div>
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
          {/* Header */}
          <div className="mb-10">
            <div className="label-mono text-ash mb-3">&mdash; Advisor Dashboard</div>
            <h1 className="display text-[36px] lg:text-[48px]">
              Welcome, <em>{data?.advisor_name?.split(' ')[0] || 'Advisor'}</em>.
            </h1>
            <p className="text-ash text-[16px] leading-[1.6] mt-3">
              Manage your client portfolios and investments
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line mb-10">
            <div className="bg-bone p-6 lg:p-8">
              <div className="label-mono text-ash mb-2">Total AUM</div>
              <div className="font-serif text-[28px] lg:text-[32px] leading-none">
                ₹{(data?.total_aum || data?.portfolio_value || 0).toLocaleString('en-IN')}
              </div>
              <div className={`text-[13px] mt-2 font-mono ${(data?.portfolio_change || 0) >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {(data?.portfolio_change || 0) >= 0 ? '+' : ''}{data?.portfolio_change || 0}% this month
              </div>
            </div>
            <div className="bg-bone p-6 lg:p-8">
              <div className="label-mono text-ash mb-2">Active Clients</div>
              <div className="font-serif text-[28px] lg:text-[32px] leading-none">{data?.active_clients || 0}</div>
              <div className="text-[13px] mt-2 text-ash font-mono">{data?.new_clients_this_month || 0} new this month</div>
            </div>
            <div className="bg-bone p-6 lg:p-8">
              <div className="label-mono text-ash mb-2">Client Satisfaction</div>
              <div className="font-serif text-[28px] lg:text-[32px] leading-none">{data?.client_satisfaction || '0.0'}/5.0</div>
              <div className="text-[13px] mt-2 text-ash font-mono">{data?.reviews_completed || 0} reviews completed</div>
            </div>
            <div className="bg-bone p-6 lg:p-8">
              <div className="label-mono text-ash mb-2">Upcoming Reviews</div>
              <div className="font-serif text-[28px] lg:text-[32px] leading-none">{data?.upcoming_reviews || 0}</div>
              <div className="text-[13px] mt-2 text-ash font-mono">scheduled this week</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Link href="/advisor-dashboard/reports" className="brut-card border border-obsidian bg-bone p-6 hover:bg-bone-deep transition-colors">
              <div className="text-[32px] mb-3">📋</div>
              <div className="font-serif text-[20px] mb-2">Client Reports</div>
              <p className="text-[13px] text-ash">Generate and manage client performance reports</p>
            </Link>
            <Link href="/advisor-dashboard/portfolio" className="brut-card border border-obsidian bg-bone p-6 hover:bg-bone-deep transition-colors">
              <div className="text-[32px] mb-3">📈</div>
              <div className="font-serif text-[20px] mb-2">Client Portfolios</div>
              <p className="text-[13px] text-ash">View and manage all client investment portfolios</p>
            </Link>
            <Link href="/advisor-dashboard/documents" className="brut-card border border-obsidian bg-bone p-6 hover:bg-bone-deep transition-colors">
              <div className="text-[32px] mb-3">📄</div>
              <div className="font-serif text-[20px] mb-2">Documents</div>
              <p className="text-[13px] text-ash">Access client KYC, agreements & statements</p>
            </Link>
          </div>

          {/* Recent Activity/Reports */}
          <div>
            <div className="label-mono text-ash mb-6">&mdash; Recent Reports</div>
            <div className="border border-obsidian bg-bone">
              <div className="px-6 lg:px-8 py-4 border-b border-line flex justify-between items-center">
                <span className="label-mono text-ash">Performance reports</span>
                <Link href="/advisor-dashboard/reports" className="text-[12px] font-mono uppercase tracking-wider2 u-link">View all</Link>
              </div>
              <div className="divide-y divide-line">
                {[
                  { title: 'Q4 2025 Performance Report', date: 'Apr 15, 2025', status: 'Ready' },
                  { title: 'Annual Portfolio Review 2025', date: 'Mar 1, 2025', status: 'Ready' },
                  { title: 'Tax Harvesting Report', date: 'Feb 20, 2025', status: 'Pending' },
                ].map((r, i) => (
                  <div key={i} className="px-6 lg:px-8 py-4 flex items-center justify-between hover:bg-bone-deep transition-colors">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-[12px] text-ash font-mono mt-0.5">{r.date}</div>
                    </div>
                    <span className={`text-[12px] font-mono px-3 py-1 border ${
                      r.status === 'Ready'
                        ? 'border-emerald-700 text-emerald-700'
                        : 'border-ash text-ash'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
  );
}
