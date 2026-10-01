'use client';

import { useEffect, useState } from 'react';
import { createClientInvitation, disableClientPortalAccess, enableClientPortalAccess,
  getClientPortalAccessStatus, type ClientPortalAccessStatus } from '@/lib/api';

export default function ClientPortalAccess({ customerId }: { customerId: number }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [status,setStatus]=useState<ClientPortalAccessStatus|null>(null);

  async function refresh(){const auth=localStorage.getItem('finplan_token');if(!auth)return;try{setStatus(await getClientPortalAccessStatus(auth,customerId));}catch{/* Access controls are shown only to authorized administrators. */}}

  useEffect(()=>{void refresh();},[customerId]);

  async function invite() {
    const token = localStorage.getItem('finplan_token');
    if (!token) return;
    setBusy(true); setError('');
    try {
      const result = await createClientInvitation(token, customerId);
      setUrl(result.invitation_url || '');
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to create invitation');
    } finally { setBusy(false); }
  }

  async function changeAccess(enabled:boolean){const auth=localStorage.getItem('finplan_token');if(!auth)return;setBusy(true);setError('');try{const result=enabled?await enableClientPortalAccess(auth,customerId):await disableClientPortalAccess(auth,customerId);setStatus(result);}catch(reason){setError(reason instanceof Error?reason.message:'Unable to change portal access');}finally{setBusy(false);}}

  return <section className="dashboard-panel p-6 lg:p-8">
    <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">Portal access</div>
    <h2 className="mt-4 font-serif text-2xl text-obsidian">Invite this client</h2>
    <p className="mt-2 text-sm text-ash">Create a single-use client portal link valid for 72 hours.</p>
    {status&&<p className="mt-3 text-xs uppercase tracking-wider text-ash">Status: {status.enabled?'Enabled':status.pending_invitation?'Invitation pending':status.account_status}</p>}
    <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>void invite()} className="rounded-full bg-obsidian px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-bone disabled:opacity-50">{busy?'Working…':'Create portal invitation'}</button>{status?.has_account&&<button type="button" disabled={busy} onClick={()=>void changeAccess(!status.enabled)} className="rounded-full border border-obsidian px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] disabled:opacity-50">{status.enabled?'Disable access':'Enable access'}</button>}</div>
    {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    {url && <div className="mt-4 flex gap-2"><input readOnly value={url} className="min-w-0 flex-1 border border-line bg-white px-3 py-2 text-xs"/><button type="button" onClick={()=>void navigator.clipboard.writeText(url)} className="border border-line bg-white px-4 text-sm">Copy</button></div>}
  </section>;
}
