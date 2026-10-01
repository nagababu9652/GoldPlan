'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bootstrapOrganization, getAccessContext } from '@/lib/api';

export default function OrganizationOnboardingPage() {
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState('');
  const [branchName, setBranchName] = useState('Head Office');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('finplan_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    void getAccessContext(token).then((access) => {
      if (access) router.replace('/advisor-dashboard');
    }).catch(() => router.replace('/login'));
  }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const token = localStorage.getItem('finplan_token');
    if (!token) return router.replace('/login');
    setError('');
    setLoading(true);
    try {
      await bootstrapOrganization(token, organizationName, branchName);
      router.replace('/advisor-dashboard');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Organization setup failed');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bone px-6 py-16 text-obsidian">
      <section className="mx-auto max-w-xl border border-line bg-white p-8 shadow-sm">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-ash">Organization setup</p>
        <h1 className="mb-3 text-4xl font-semibold">Create your advisory firm</h1>
        <p className="mb-8 text-sm leading-6 text-ash">
          This creates your organization and makes your verified account its first Head.
        </p>
        {error && <div className="mb-5 border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        <form onSubmit={submit} className="space-y-5">
          <label className="block text-sm">
            <span className="mb-2 block">Organization name</span>
            <input required minLength={2} maxLength={250} value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
              className="w-full border border-line bg-bone px-4 py-3 focus:border-obsidian focus:outline-none" />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block">Main branch</span>
            <input required minLength={2} maxLength={200} value={branchName}
              onChange={(event) => setBranchName(event.target.value)}
              className="w-full border border-line bg-bone px-4 py-3 focus:border-obsidian focus:outline-none" />
          </label>
          <button disabled={loading} className="w-full bg-obsidian px-5 py-3 text-sm font-medium text-bone disabled:opacity-50">
            {loading ? 'Creating organization…' : 'Create organization'}
          </button>
        </form>
      </section>
    </main>
  );
}
