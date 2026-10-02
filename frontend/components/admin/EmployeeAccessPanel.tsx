'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAdminEmployeePermissions, listAdminPermissionProfiles, listAdminPermissions,
  setAdminEmployeeOverrides, setAdminEmployeeProfiles, type AdminPermission,
  createEmployeeInvitation,
  type AdminPermissionProfile,
} from '@/lib/api';
import { useSingleSubmission } from '@/lib/use-single-submission';

type Choice='INHERIT'|'ALLOW'|'DENY';

export default function EmployeeAccessPanel({employeeId}:{employeeId:number}){
  const {run:runInvitation,submitting:inviting,keyFor,clearKey}=useSingleSubmission();
  const [profiles,setProfiles]=useState<AdminPermissionProfile[]>([]);const [permissions,setPermissions]=useState<AdminPermission[]>([]);
  const [selected,setSelected]=useState<number[]>([]);const [overrides,setOverrides]=useState<Record<string,Choice>>({});
  const [error,setError]=useState('');const [saved,setSaved]=useState('');
  const [invitationUrl,setInvitationUrl]=useState('');
  const token=()=>localStorage.getItem('finplan_token')||'';
  const load=useCallback(async()=>{try{const t=token();const [available,all,state]=await Promise.all([listAdminPermissionProfiles(t),listAdminPermissions(t),getAdminEmployeePermissions(t,employeeId)]);setProfiles(available);setPermissions(all);setSelected(state.profiles.map(x=>x.id));setOverrides(Object.fromEntries(state.overrides.map(x=>[x.permission_code,x.allow_access?'ALLOW':'DENY'])));}catch(reason){setError(reason instanceof Error?reason.message:'Unable to load access settings');}},[employeeId]);
  useEffect(()=>{void load();},[load]);
  const modules=useMemo(()=>Array.from(new Set(permissions.map(x=>x.module_name))),[permissions]);
  async function saveProfiles(){setError('');setSaved('');try{await setAdminEmployeeProfiles(token(),employeeId,selected);setSaved('Permission profiles saved');await load();}catch(reason){setError(reason instanceof Error?reason.message:'Unable to save profiles');}}
  async function saveOverrides(){setError('');setSaved('');try{await setAdminEmployeeOverrides(token(),employeeId,Object.entries(overrides).filter(([,value])=>value!=='INHERIT').map(([permission_code,value])=>({permission_code,allow_access:value==='ALLOW'})));setSaved('Individual overrides saved');await load();}catch(reason){setError(reason instanceof Error?reason.message:'Unable to save overrides');}}
  async function invite(){await runInvitation(async()=>{setError('');try{const result=await createEmployeeInvitation(token(),employeeId,keyFor({employeeId}));clearKey();setInvitationUrl(result.invitation_url||'');setSaved('Invitation created');}catch(reason){setError(reason instanceof Error?reason.message:'Unable to create invitation');}});}
  return <section className="space-y-6 border border-line bg-white p-6"><div><h2 className="text-xl font-semibold">Access</h2><p className="mt-1 text-sm text-ash">Profiles provide base permissions. Individual deny overrides always take precedence.</p></div>{error&&<div className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>}{saved&&<p className="text-sm text-green-700">{saved}</p>}
    <div className="border border-line bg-bone-deep p-4"><h3 className="text-sm font-semibold">Employee login</h3><p className="mt-1 text-xs text-ash">Create a single-use link valid for 72 hours. Creating another link revokes the previous pending link.</p><button type="button" disabled={inviting} onClick={()=>void invite()} className="mt-3 bg-obsidian px-4 py-2 text-sm text-bone disabled:opacity-50">{inviting?'Creating…':'Create invitation'}</button>{invitationUrl&&<div className="mt-3 flex gap-2"><input readOnly value={invitationUrl} className="min-w-0 flex-1 border border-line bg-white px-3 py-2 text-xs"/><button type="button" onClick={()=>void navigator.clipboard.writeText(invitationUrl)} className="border border-line bg-white px-3 text-sm">Copy</button></div>}</div>
    <div><h3 className="mb-3 text-xs uppercase tracking-wider text-ash">Permission profiles</h3><div className="grid gap-2 md:grid-cols-2">{profiles.map(profile=><label key={profile.id} className="flex gap-3 border border-line p-3 text-sm"><input type="checkbox" checked={selected.includes(profile.id)} onChange={event=>setSelected(current=>event.target.checked?[...current,profile.id]:current.filter(id=>id!==profile.id))}/><span><strong>{profile.profile_name}</strong><small className="block text-ash">{profile.profile_code}</small></span></label>)}</div><button type="button" onClick={()=>void saveProfiles()} className="mt-3 bg-obsidian px-4 py-2 text-sm text-bone">Save profiles</button></div>
    <div><h3 className="mb-3 text-xs uppercase tracking-wider text-ash">Individual overrides</h3><div className="max-h-[32rem] overflow-y-auto border border-line">{modules.map(module=><div key={module}><div className="sticky top-0 bg-bone-deep px-3 py-2 text-xs font-semibold uppercase tracking-wider">{module}</div>{permissions.filter(x=>x.module_name===module).map(permission=><label key={permission.id} className="flex items-center justify-between gap-4 border-t border-line px-3 py-2 text-sm"><span>{permission.permission_name}<small className="block font-mono text-ash">{permission.permission_code}</small></span><select value={overrides[permission.permission_code]||'INHERIT'} onChange={event=>setOverrides(current=>({...current,[permission.permission_code]:event.target.value as Choice}))} className="border border-line bg-bone px-2 py-1"><option value="INHERIT">Inherit</option><option value="ALLOW">Allow</option><option value="DENY">Deny</option></select></label>)}</div>)}</div><button type="button" onClick={()=>void saveOverrides()} className="mt-3 bg-obsidian px-4 py-2 text-sm text-bone">Save overrides</button></div>
  </section>;
}
