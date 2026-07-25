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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-ash">Loading profile...</div>
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
          <div className="label-mono text-ash mb-3">&mdash; Profile</div>
          <h1 className="display text-[36px] lg:text-[48px]">
            Advisor Profile
          </h1>
          <p className="text-ash text-[16px] leading-[1.6] mt-3">
            Manage your advisor account and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="border border-obsidian bg-bone p-6 lg:p-10">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-20 h-20 bg-antique rounded-full flex items-center justify-center text-[32px] font-medium text-obsidian">
              {data?.first_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-[24px] mb-1">{data?.first_name} {data?.last_name}</h2>
              <p className="text-ash text-[14px]">{data?.email}</p>
              <div className="flex gap-2 mt-3">
                <span className="text-[12px] font-mono px-3 py-1 border border-obsidian">{data?.role}</span>
                <span className="text-[12px] font-mono px-3 py-1 border border-emerald-700 text-emerald-700">{data?.plan_type}</span>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="label-mono text-ash mb-2">First Name</div>
              <div className="text-[15px]">{data?.first_name}</div>
            </div>
            <div>
              <div className="label-mono text-ash mb-2">Last Name</div>
              <div className="text-[15px]">{data?.last_name}</div>
            </div>
            <div>
              <div className="label-mono text-ash mb-2">Email</div>
              <div className="text-[15px]">{data?.email}</div>
            </div>
            <div>
              <div className="label-mono text-ash mb-2">Phone</div>
              <div className="text-[15px]">{data?.phone || 'Not provided'}</div>
            </div>
            <div>
              <div className="label-mono text-ash mb-2">Member Since</div>
              <div className="text-[15px]">{data?.member_since ? new Date(data.member_since).toLocaleDateString('en-IN') : 'N/A'}</div>
            </div>
            <div>
              <div className="label-mono text-ash mb-2">Plan Type</div>
              <div className="text-[15px]">{data?.plan_type}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}