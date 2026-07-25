'use client';

import { useState, useEffect } from 'react';
import { getAdvisorReports, type AdvisorReports } from '@/lib/api';

export default function AdvisorReportsPage() {
  const [data, setData] = useState<AdvisorReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('finplan_token');
    if (!token) return;

    getAdvisorReports(token)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-ash">Loading reports...</div>
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
          <div className="label-mono text-ash mb-3">&mdash; Reports</div>
          <h1 className="display text-[36px] lg:text-[48px]">
            Client Reports
          </h1>
          <p className="text-ash text-[16px] leading-[1.6] mt-3">
            Generate and deliver performance reports for your clients
          </p>
        </div>

        {/* Reports List */}
        <div className="border border-obsidian bg-bone">
          <div className="px-6 lg:px-8 py-4 border-b border-line">
            <span className="label-mono text-ash">Client Performance Reports</span>
          </div>
          <div className="divide-y divide-line">
            {data?.reports?.map((report) => (
              <div key={report.id} className="px-6 lg:px-8 py-4 flex items-center justify-between hover:bg-bone-deep transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-[15px]">{report.title}</div>
                  <div className="text-[12px] text-ash font-mono mt-1">
                    {report.date} • {report.type}
                  </div>
                </div>
                <span className={`text-[12px] font-mono px-3 py-1 border ${
                  report.status === 'ready'
                    ? 'border-emerald-700 text-emerald-700'
                    : 'border-ash text-ash'
                }`}>
                  {report.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}