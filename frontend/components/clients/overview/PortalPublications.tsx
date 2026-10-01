'use client';

import { useCallback, useEffect, useState } from 'react';
import { getDocuments, listPortalPublications, listReportSnapshots, publishPortalResource,
  revokePortalPublication, type Document, type PortalPublication,
  type ReportSnapshotSummary } from '@/lib/api';

export default function PortalPublications({ customerId }: { customerId: number }) {
  const [documents,setDocuments]=useState<Document[]>([]);
  const [reports,setReports]=useState<ReportSnapshotSummary[]>([]);
  const [publications,setPublications]=useState<PortalPublication[]>([]);
  const [error,setError]=useState('');
  const token=()=>localStorage.getItem('finplan_token')||'';
  const load=useCallback(async()=>{const auth=token();if(!auth)return;try{const [docs,snaps,pubs]=await Promise.all([getDocuments(auth,{customer_id:customerId,status:'ACTIVE'}),listReportSnapshots(auth),listPortalPublications(auth,customerId)]);setDocuments(docs.documents);setReports(snaps.reports);setPublications(pubs);}catch(reason){setError(reason instanceof Error?reason.message:'Unable to load publications');}},[customerId]);
  useEffect(()=>{void load();},[load]);
  const publication=(type:'DOCUMENT'|'REPORT',id:number)=>publications.find(row=>row.resource_type===type&&row.resource_id===id);
  async function toggle(type:'DOCUMENT'|'REPORT',id:number){setError('');try{const current=publication(type,id);if(current)await revokePortalPublication(token(),customerId,current.id);else await publishPortalResource(token(),customerId,type,id);await load();}catch(reason){setError(reason instanceof Error?reason.message:'Unable to change publication');}}
  return <section className="dashboard-panel p-6 lg:p-8"><div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">Client portal publications</div><h2 className="mt-4 font-serif text-2xl">Approved documents and reports</h2><p className="mt-2 text-sm text-ash">Only explicitly published items are visible and downloadable in this client&apos;s portal.</p>{error&&<p className="mt-3 text-sm text-red-700">{error}</p>}
    <div className="mt-5 grid gap-5 lg:grid-cols-2"><div><h3 className="text-xs font-mono uppercase tracking-wider2 text-ash">Documents</h3><div className="mt-2 space-y-2">{documents.map(row=>{const active=publication('DOCUMENT',row.id);return <div key={row.id} className="flex items-center justify-between gap-3 border border-line p-3"><span className="min-w-0 truncate text-sm">{row.document_name}</span><button type="button" onClick={()=>void toggle('DOCUMENT',row.id)} className="shrink-0 rounded-full border border-obsidian px-3 py-1 text-[10px] uppercase tracking-wider">{active?'Revoke':'Publish'}</button></div>})}{documents.length===0&&<p className="text-sm text-ash">No active customer documents.</p>}</div></div>
    <div><h3 className="text-xs font-mono uppercase tracking-wider2 text-ash">Saved report versions</h3><div className="mt-2 space-y-2">{reports.map(row=>{const active=publication('REPORT',row.id);return <div key={row.id} className="flex items-center justify-between gap-3 border border-line p-3"><span className="min-w-0 text-sm"><span className="block truncate">{row.title}</span><span className="text-xs text-ash">{row.report_date}</span></span><button type="button" onClick={()=>void toggle('REPORT',row.id)} className="shrink-0 rounded-full border border-obsidian px-3 py-1 text-[10px] uppercase tracking-wider">{active?'Revoke':'Publish'}</button></div>})}{reports.length===0&&<p className="text-sm text-ash">No saved report versions.</p>}</div></div></div></section>;
}
