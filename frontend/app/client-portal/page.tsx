'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAccessContext, getClientPortalDashboard, getClientPortalGoals,
  getClientPortalHousehold, getClientPortalInvestments, getClientPortalProfile,
  getClientPortalTransactions, getClientPortalDocuments, getClientPortalReports,
  getClientPortalMessages,
  downloadClientPortalDocument, downloadClientPortalReport,
  type ClientPortalDashboard, type ClientPortalDocument, type ClientPortalGoal,
  type ClientPortalHousehold, type ClientPortalInvestment, type ClientPortalProfile,
  type ClientPortalReport, type ClientPortalTransaction,
  type ClientPortalMessage,
} from '@/lib/api';
import LogoutButton from '@/components/auth/LogoutButton';

type PortalData = {
  dashboard: ClientPortalDashboard;
  profile: ClientPortalProfile;
  goals: ClientPortalGoal[];
  investments: ClientPortalInvestment[];
  transactions: ClientPortalTransaction[];
  household: ClientPortalHousehold | null;
  documents: ClientPortalDocument[];
  reports: ClientPortalReport[];
  messages: ClientPortalMessage[];
};

const money = (value: number, currency = 'INR') => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency, maximumFractionDigits: 0,
}).format(value);

export default function ClientPortalPage() {
  const router = useRouter();
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('finplan_token');
    if (!token) { router.replace('/login'); return; }
    void getAccessContext(token).then(async access => {
      if (!access || access.actor_type !== 'CLIENT') { router.replace('/login'); return; }
      const [dashboard, profile, goals, investments, transactions, household, documents, reports, messages] = await Promise.all([
        getClientPortalDashboard(token), getClientPortalProfile(token),
        getClientPortalGoals(token), getClientPortalInvestments(token),
        getClientPortalTransactions(token), getClientPortalHousehold(token),
        getClientPortalDocuments(token), getClientPortalReports(token),
        getClientPortalMessages(token),
      ]);
      setData({ dashboard, profile, goals, investments, transactions, household, documents, reports, messages });
    }).catch(reason => setError(reason instanceof Error ? reason.message : 'Unable to load portal'));
  }, [router]);

  return <main className="min-h-screen bg-bone p-6 text-obsidian lg:p-12">
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between gap-4"><div className="label-mono text-ash">FinPlan · Client portal</div><LogoutButton className="flex items-center gap-2 rounded-full border border-obsidian px-4 py-2 text-xs uppercase tracking-wider"/></div>
      <nav className="mt-5 flex flex-wrap gap-2 text-xs uppercase tracking-wider">
        {['profile','goals','investments','transactions','household','documents','reports','messages'].map(item => <a key={item} href={`#${item}`} className="rounded-full border border-line bg-white px-4 py-2">{item}</a>)}
      </nav>
      {error && <p className="mt-6 border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>}
      {!data && !error && <p className="mt-6 text-ash">Loading your financial plan…</p>}
      {data && <div className="space-y-5">
        <header className="mt-8 border-b border-line pb-8"><h1 className="font-serif text-4xl lg:text-6xl">Welcome, {data.dashboard.display_name}</h1><p className="mt-2 text-sm text-ash">Client {data.dashboard.customer_code}</p></header>

        <section id="profile" className="border border-line bg-white p-6"><p className="label-mono text-ash">My profile</p><h2 className="mt-3 font-serif text-2xl">{data.profile.display_name}</h2><div className="mt-4 grid gap-3 text-sm text-ash md:grid-cols-2"><p>{data.profile.email || 'No email on file'}</p><p>{data.profile.mobile_number || 'No mobile on file'}</p><p>{data.profile.occupation || 'Occupation not recorded'}</p><p>{data.profile.resident_status || 'Resident status not recorded'}</p></div></section>

        <section id="goals" className="border border-line bg-white p-6"><p className="label-mono text-ash">My goals</p><div className="mt-4 grid gap-3 md:grid-cols-2">{data.goals.map(goal => <article key={goal.id} className="border border-line p-4"><div className="flex justify-between gap-4"><h3 className="font-serif text-xl">{goal.title}</h3><span className="text-xs text-ash">{goal.status}</span></div><p className="mt-3 text-sm">{money(goal.current_amount)} of {money(goal.target_amount)}</p><div className="mt-2 h-2 bg-bone-deep"><div className="h-2 bg-obsidian" style={{width:`${Math.min(100,(goal.current_amount/goal.target_amount)*100)}%`}} /></div><p className="mt-2 text-xs text-ash">Target {goal.target_date}</p></article>)}{data.goals.length===0&&<p className="text-sm text-ash">No active goals.</p>}</div></section>

        <section id="investments" className="border border-line bg-white p-6"><p className="label-mono text-ash">My investments</p><div className="mt-4 space-y-3">{data.investments.map(account => <article key={account.id} className="border border-line p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-serif text-xl">{account.account_name}</h3><p className="text-xs text-ash">{account.institution_name || account.account_type} {account.account_number_masked || ''}</p></div><strong>{money(account.current_balance,account.currency_code)}</strong></div>{account.holdings.length>0&&<div className="mt-4 space-y-2 border-t border-line pt-3">{account.holdings.map(holding=><div key={holding.id} className="flex justify-between gap-4 text-sm"><span>{holding.security_name}</span><span>{money(holding.quantity*holding.current_price,account.currency_code)}</span></div>)}</div>}</article>)}{data.investments.length===0&&<p className="text-sm text-ash">No active financial accounts.</p>}</div></section>

        <section id="transactions" className="border border-line bg-white p-6"><p className="label-mono text-ash">My transactions</p><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-line text-xs uppercase tracking-wider text-ash"><tr><th className="py-3">Date</th><th>Type</th><th>Description</th><th>Status</th><th className="text-right">Amount</th></tr></thead><tbody>{data.transactions.map(row=><tr key={row.id} className="border-b border-line/70"><td className="py-3">{row.transaction_date}</td><td>{row.transaction_type}</td><td>{row.description || '—'}</td><td>{row.status}</td><td className="text-right">{money(row.amount)}</td></tr>)}</tbody></table>{data.transactions.length===0&&<p className="py-4 text-sm text-ash">No transactions.</p>}</div></section>

        <section id="household" className="border border-line bg-white p-6"><p className="label-mono text-ash">My household</p>{data.household?<><h2 className="mt-3 font-serif text-2xl">{data.household.group_name}</h2><div className="mt-4 divide-y divide-line">{data.household.members.map(member=><div key={member.customer_id} className="flex justify-between py-3 text-sm"><span>{member.display_name}{member.is_group_head?' · Head':''}</span><span className="text-ash">{member.relationship_type || 'Member'}</span></div>)}</div></>:<p className="mt-4 text-sm text-ash">No active household membership.</p>}</section>

        <section id="documents" className="border border-line bg-white p-6"><p className="label-mono text-ash">My documents</p><div className="mt-4 divide-y divide-line">{data.documents.map(row=><div key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><h3 className="text-sm font-medium">{row.document_name}</h3><p className="text-xs text-ash">{row.document_type} · Published {new Date(row.published_at).toLocaleDateString('en-IN')}</p></div><button type="button" onClick={()=>void download('document',row.id,row.file_name||row.document_name)} className="rounded-full border border-obsidian px-3 py-1 text-[10px] uppercase tracking-wider">Download</button></div>)}{data.documents.length===0&&<p className="text-sm text-ash">No documents have been published to your portal.</p>}</div></section>

        <section id="reports" className="border border-line bg-white p-6"><p className="label-mono text-ash">My reports</p><div className="mt-4 grid gap-3 md:grid-cols-2">{data.reports.map(row=><article key={row.id} className="border border-line p-4"><h3 className="font-serif text-xl">{row.title}</h3><p className="mt-1 text-xs text-ash">Report date {row.report_date}</p><p className="mt-3 text-sm">Net worth {money(Number(row.client.net_worth||0))}</p><button type="button" onClick={()=>void download('report',row.id,`financial-report-${row.id}-${row.report_date}.csv`)} className="mt-4 rounded-full border border-obsidian px-3 py-1 text-[10px] uppercase tracking-wider">Download CSV</button></article>)}{data.reports.length===0&&<p className="text-sm text-ash">No reports have been published to your portal.</p>}</div></section>

        <section id="messages" className="border border-line bg-white p-6"><p className="label-mono text-ash">Messages</p><div className="mt-4 divide-y divide-line">{data.messages.map(row=><article key={row.id} className="py-4"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-medium">{row.subject||row.message_type}</h3><time className="text-xs text-ash">{new Date(row.sent_at).toLocaleString('en-IN')}</time></div><p className="mt-2 whitespace-pre-wrap text-sm text-ash">{row.body}</p><p className="mt-2 text-xs text-ash">From {row.sender_name}</p></article>)}{data.messages.length===0&&<p className="text-sm text-ash">No messages.</p>}</div></section>
      </div>}
    </div>
  </main>;

  async function download(kind:'document'|'report',id:number,filename:string){const token=localStorage.getItem('finplan_token');if(!token)return;try{const blob=kind==='document'?await downloadClientPortalDocument(token,id):await downloadClientPortalReport(token,id);const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url);}catch(reason){setError(reason instanceof Error?reason.message:'Download failed');}}
}
