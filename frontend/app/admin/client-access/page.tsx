'use client';

import Link from 'next/link';
import {useCallback,useEffect,useState} from 'react';
import {createClientInvitation,disableClientPortalAccess,enableClientPortalAccess,
  listAdminClientAccess,type AdminClientAccess} from '@/lib/api';
import {useSingleSubmission} from '@/lib/use-single-submission';

export default function ClientAccessPage(){
  const {run,keyFor,clearKey}=useSingleSubmission();
  const [clients,setClients]=useState<AdminClientAccess[]>([]);
  const [search,setSearch]=useState('');
  const [status,setStatus]=useState('');
  const [loading,setLoading]=useState(true);
  const [busyId,setBusyId]=useState<number|null>(null);
  const [error,setError]=useState('');
  const [invitation,setInvitation]=useState<{name:string;url:string}|null>(null);

  const load=useCallback(async()=>{
    const token=localStorage.getItem('finplan_token');
    if(!token){setError('Please sign in again.');setLoading(false);return;}
    setLoading(true);
    try{setClients(await listAdminClientAccess(token,search,status));setError('');}
    catch(reason){setError(reason instanceof Error?reason.message:'Unable to load clients');}
    finally{setLoading(false);}
  },[search,status]);
  useEffect(()=>{const timer=setTimeout(()=>void load(),300);return()=>clearTimeout(timer);},[load]);

  async function act(client:AdminClientAccess,action:'invite'|'enable'|'disable'){
    const token=localStorage.getItem('finplan_token');if(!token)return;
    await run(async()=>{
    setBusyId(client.customer_id);setError('');
    try{
      if(action==='invite'){
        const result=await createClientInvitation(token,client.customer_id,keyFor({customerId:client.customer_id}));
        clearKey();
        setInvitation({name:client.display_name,url:result.invitation_url||''});
      }else if(action==='enable')await enableClientPortalAccess(token,client.customer_id);
      else await disableClientPortalAccess(token,client.customer_id);
      await load();
    }catch(reason){setError(reason instanceof Error?reason.message:'Unable to update client access');}
    finally{setBusyId(null);}
    });
  }

  return <main className="min-h-screen bg-bone px-6 py-12 text-obsidian"><section className="mx-auto max-w-6xl space-y-6">
    <div><p className="font-mono text-xs uppercase tracking-[.2em] text-ash">Administration</p><h1 className="mt-2 font-serif text-4xl">Client Access</h1><p className="mt-2 text-sm text-ash">Manage client portal invitations and login access separately from employee accounts.</p></div>
    <div className="grid gap-3 border border-line bg-white p-4 md:grid-cols-2"><label className="text-xs uppercase tracking-wider text-ash">Search clients<input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Name, code, email or phone" className="mt-2 w-full border border-line bg-bone px-3 py-2 text-sm normal-case tracking-normal text-obsidian"/></label><label className="text-xs uppercase tracking-wider text-ash">Client status<select value={status} onChange={event=>setStatus(event.target.value)} className="mt-2 w-full border border-line bg-bone px-3 py-2 text-sm normal-case tracking-normal text-obsidian"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="PROSPECT">Prospect</option></select></label></div>
    {error&&<p role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {invitation&&<div className="border border-line bg-white p-4"><p className="text-sm font-medium">Invitation for {invitation.name}</p><p className="mt-1 text-xs text-ash">Share this single-use link with the client. It expires after 72 hours.</p><div className="mt-3 flex gap-2"><input aria-label="Invitation link" readOnly value={invitation.url} className="min-w-0 flex-1 border border-line bg-bone px-3 py-2 text-xs"/><button type="button" onClick={()=>void navigator.clipboard.writeText(invitation.url)} className="border border-line px-4 text-sm">Copy</button></div></div>}
    <div className="overflow-x-auto border border-line bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-line bg-bone-deep text-xs uppercase tracking-wider text-ash"><tr><th className="p-4">Client</th><th className="p-4">Contact</th><th className="p-4">Portal</th><th className="p-4">Actions</th></tr></thead><tbody>{loading?<tr><td colSpan={4} className="p-5 text-ash">Loading clients…</td></tr>:clients.length===0?<tr><td colSpan={4} className="p-5 text-ash">No clients match these filters.</td></tr>:clients.map(client=><tr key={client.customer_id} className="border-b border-line last:border-0"><td className="p-4"><Link href={`/advisor-dashboard/clients/${client.customer_id}`} className="font-medium underline">{client.display_name}</Link><p className="text-xs text-ash">{client.customer_code} · {client.customer_status}</p></td><td className="p-4 text-ash">{client.email||client.mobile_number||'No contact details'}</td><td className="p-4">{client.enabled?'Enabled':client.pending_invitation?'Invitation pending':client.has_account?'Disabled':'Not invited'}</td><td className="p-4"><div className="flex flex-wrap gap-3">{!client.enabled&&<button type="button" disabled={busyId===client.customer_id||!client.email} onClick={()=>void act(client,'invite')} className="underline disabled:opacity-50">{client.pending_invitation?'New invitation':'Invite'}</button>}{client.has_account&&<button type="button" disabled={busyId===client.customer_id} onClick={()=>void act(client,client.enabled?'disable':'enable')} className="underline disabled:opacity-50">{client.enabled?'Disable':'Enable'}</button>}{client.pending_invitation&&!client.has_account&&<button type="button" disabled={busyId===client.customer_id} onClick={()=>void act(client,'disable')} className="underline disabled:opacity-50">Cancel invitation</button>}</div></td></tr>)}</tbody></table></div>
  </section></main>;
}
