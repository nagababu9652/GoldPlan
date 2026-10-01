'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAccessContext } from '@/lib/api';
import LogoutButton from '@/components/auth/LogoutButton';

const links=[
  ['Organization','/admin/organization'],
  ['Branches','/admin/organization/branches'],
  ['Departments','/admin/organization/departments'],
  ['Designations','/admin/organization/designations'],
  ['Employees','/admin/organization/employees'],
  ['Associates','/admin/organization/associates'],
  ['Agencies','/admin/organization/agencies'],
  ['ARN Holders','/admin/organization/arn-holders'],
  ['Subscription','/admin/subscription'],
] as const;

export default function AdminLayout({children}:{children:React.ReactNode}){
  const pathname=usePathname();const router=useRouter();const [ready,setReady]=useState(false);
  useEffect(()=>{const token=localStorage.getItem('finplan_token');if(!token){router.replace('/login');return;}void getAccessContext(token).then(context=>{if(!context){router.replace('/onboarding/organization');return;}if(context.actor_type!=='HEAD'){router.replace('/advisor-dashboard');return;}setReady(true);}).catch(()=>router.replace('/login'));},[router]);
  if(!ready)return <main className="min-h-screen bg-bone p-12 text-ash">Loading…</main>;
  return <div className="min-h-screen bg-bone text-obsidian"><header className="border-b border-line bg-obsidian text-bone"><div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4"><Link href="/advisor-dashboard" className="font-serif text-2xl text-antique-light">FinPlan.</Link><span className="font-mono text-xs uppercase tracking-[.2em] text-ash-light">Administration</span><Link href="/advisor-dashboard" className="ml-auto text-sm text-ash-light hover:text-bone">Back to dashboard</Link><LogoutButton className="flex items-center gap-2 text-sm text-ash-light hover:text-bone"/></div></header><nav className="border-b border-line bg-white"><div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6">{links.map(([label,href])=>{const active=pathname===href||pathname.startsWith(`${href}/`);return <Link key={href} href={href} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm ${active?'border-antique text-obsidian':'border-transparent text-ash hover:text-obsidian'}`}>{label}</Link>;})}</div></nav>{children}</div>;
}
