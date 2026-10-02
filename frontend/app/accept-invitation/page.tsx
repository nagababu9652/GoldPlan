'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { acceptAccessInvitation, previewAccessInvitation } from '@/lib/api';
import { useSingleSubmission } from '@/lib/use-single-submission';

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-bone" />}>
      <AcceptInvitationContent />
    </Suspense>
  );
}

function AcceptInvitationContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';
  const [preview, setPreview] = useState<{ email: string; display_name: string; invitation_type: string } | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const { run, finish, submitting } = useSingleSubmission();

  useEffect(() => {
    if (!token) {
      setError('Invitation token is missing');
      return;
    }
    void previewAccessInvitation(token).then(setPreview).catch((reason) =>
      setError(reason instanceof Error ? reason.message : 'Unable to load invitation')
    );
  }, [token]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (done) return;
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    await run(async () => {
      setError('');
      try {
        await acceptAccessInvitation(token, password);
        finish();
        setDone(true);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Unable to accept invitation');
      }
    });
  }

  const client = preview?.invitation_type === 'CLIENT_PORTAL';
  return (
    <main className="flex min-h-screen items-center justify-center bg-bone p-6">
      <section className="w-full max-w-md border border-line bg-white p-8">
        <h1 className="text-3xl font-semibold">{client ? 'Client portal invitation' : 'Employee invitation'}</h1>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        {done ? (
          <div className="mt-6">
            <p>Access activated successfully.</p>
            <button onClick={() => router.push('/login')} className="mt-4 bg-obsidian px-5 py-3 text-bone">Continue to login</button>
          </div>
        ) : preview && (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <p className="text-sm text-ash">Welcome, {preview.display_name}. Activate access for {preview.email}.</p>
            <input required minLength={10} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create password" className="w-full border border-line px-4 py-3" />
            <input required minLength={10} type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Confirm password" className="w-full border border-line px-4 py-3" />
            <button disabled={submitting} className="w-full bg-obsidian px-5 py-3 text-bone disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? 'Activating…' : `Activate ${client ? 'client portal' : 'employee'} access`}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
