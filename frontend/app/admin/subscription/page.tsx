'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessContext, type AccessContext } from '@/lib/api';

export default function SubscriptionStatusPage() {
  const router = useRouter();
  const [access, setAccess] = useState<AccessContext | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('finplan_token');
    if (!token) return router.replace('/login');
    void getAccessContext(token).then((result) => {
      if (!result) return router.replace('/onboarding/organization');
      setAccess(result);
    }).catch(() => setError('Unable to load subscription status.'));
  }, [router]);

  const periodEnd = access?.subscription_period_end
    ? new Date(access.subscription_period_end).toLocaleDateString('en-IN')
    : 'Not available';

  return (
    <main className="min-h-screen bg-bone px-6 py-16 text-obsidian">
      <section className="mx-auto max-w-2xl border border-line bg-white p-8 shadow-sm">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-ash">Account access</p>
        <h1 className="mb-3 text-4xl font-semibold">Subscription</h1>
        {error ? <p className="text-red-700">{error}</p> : !access ? (
          <p className="text-ash">Loading subscription status…</p>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-line bg-bone p-4">
                <p className="text-xs uppercase tracking-wider text-ash">Status</p>
                <p className="mt-2 text-xl font-medium">{access.subscription_status}</p>
              </div>
              <div className="border border-line bg-bone p-4">
                <p className="text-xs uppercase tracking-wider text-ash">Current period ends</p>
                <p className="mt-2 text-xl font-medium">{periodEnd}</p>
              </div>
            </div>
            {access.subscription_active ? (
              <button onClick={() => router.push('/advisor-dashboard')}
                className="bg-obsidian px-5 py-3 text-sm font-medium text-bone">
                Continue to dashboard
              </button>
            ) : (
              <div className="border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                Your organization subscription is inactive. Billing activation is not connected yet;
                contact the platform administrator to restore access.
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
