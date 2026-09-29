'use client';

import { useState, useEffect } from 'react';
import { getAdvisorProfile, type AdvisorProfile } from '@/lib/api';

export default function AdvisorProfilePage() {
  const [data, setData] = useState<AdvisorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('finplan_token');
    if (!token) return;

    getAdvisorProfile(token)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">Profile</div>
        <div className="mt-4 text-sm text-ash">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-red-200 bg-red-50">Profile</div>
        <div className="mt-4 text-sm text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Profile
        </div>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
          Advisor Profile
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ash">
          Manage your advisor account and preferences
        </p>
      </section>

      {/* Profile Card */}
      <div className="dashboard-panel p-6 lg:p-10">
          <div className="flex items-start gap-6 mb-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-antique text-[32px] font-medium text-obsidian">
              {data?.first_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-2xl text-obsidian">{data?.first_name} {data?.last_name}</h2>
              <p className="mt-1 text-sm text-ash">{data?.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">{data?.role}</span>
                <span className="dashboard-pill border-emerald-700/20 bg-emerald-50 text-emerald-700">{data?.plan_type}</span>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-ash">First Name</div>
              <div className="text-[15px] text-obsidian">{data?.first_name}</div>
            </div>
            <div>
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-ash">Last Name</div>
              <div className="text-[15px] text-obsidian">{data?.last_name}</div>
            </div>
            <div>
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-ash">Email</div>
              <div className="text-[15px] text-obsidian">{data?.email}</div>
            </div>
            <div>
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-ash">Phone</div>
              <div className="text-[15px] text-obsidian">{data?.phone || 'Not provided'}</div>
            </div>
            <div>
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-ash">Member Since</div>
              <div className="text-[15px] text-obsidian">{data?.member_since ? new Date(data.member_since).toLocaleDateString('en-IN') : 'N/A'}</div>
            </div>
            <div>
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-ash">Plan Type</div>
              <div className="text-[15px] text-obsidian">{data?.plan_type}</div>
            </div>
          </div>
        </div>
    </div>
  );
}