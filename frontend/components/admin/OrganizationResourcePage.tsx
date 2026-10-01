'use client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createAdminBranch, createAdminDepartment, createAdminDesignation,
  listAdminBranches, listAdminDepartments, listAdminDesignations,
  setAdminBranchActive, setAdminDepartmentActive, setAdminDesignationActive,
  type AdminBranch, type AdminDepartment, type AdminDesignation,
} from '@/lib/api';

type Kind='branches'|'departments'|'designations';
type Item=AdminBranch|AdminDepartment|AdminDesignation;
const labels={branches:'Branches',departments:'Departments',designations:'Designations'};

export default function OrganizationResourcePage({kind}:{kind:Kind}){
  const router=useRouter(); const [items,setItems]=useState<Item[]>([]); const [branches,setBranches]=useState<AdminBranch[]>([]);
  const [code,setCode]=useState(''); const [name,setName]=useState(''); const [branchId,setBranchId]=useState('');
  const [error,setError]=useState(''); const [loading,setLoading]=useState(true);
  const token=()=>localStorage.getItem('finplan_token')||'';
  const load=useCallback(async()=>{const t=token(); if(!t){router.replace('/login');return;} setLoading(true); try{
    if(kind==='branches') setItems(await listAdminBranches(t));
    if(kind==='departments'){const b=await listAdminBranches(t);setBranches(b.filter(x=>x.is_active));setItems(await listAdminDepartments(t));}
    if(kind==='designations') setItems(await listAdminDesignations(t));
  }catch(e){setError(e instanceof Error?e.message:'Unable to load records');}finally{setLoading(false);}},[kind,router]);
  useEffect(()=>{void load();},[load]);
  async function submit(e:FormEvent){e.preventDefault();setError('');try{const t=token();
    if(kind==='branches') await createAdminBranch(t,{branch_code:code,branch_name:name,branch_type:'BRANCH'});
    if(kind==='departments') await createAdminDepartment(t,{department_code:code,department_name:name,branch_id:Number(branchId)});
    if(kind==='designations') await createAdminDesignation(t,{designation_code:code,designation_name:name});
    setCode('');setName('');await load();
  }catch(reason){setError(reason instanceof Error?reason.message:'Unable to create record');}}
  async function toggle(item:Item){try{const t=token();
    if(kind==='branches') await setAdminBranchActive(t,item.id,!item.is_active);
    if(kind==='departments') await setAdminDepartmentActive(t,item.id,!item.is_active);
    if(kind==='designations') await setAdminDesignationActive(t,item.id,!item.is_active);
    await load();
  }catch(reason){setError(reason instanceof Error?reason.message:'Unable to update status');}}
  const itemCode=(x:Item)=>'branch_code'in x?x.branch_code:'department_code'in x?x.department_code:x.designation_code;
  const itemName=(x:Item)=>'branch_name'in x?x.branch_name:'department_name'in x?x.department_name:x.designation_name;
  return <main className="min-h-screen bg-bone px-6 py-12 text-obsidian"><section className="mx-auto max-w-5xl space-y-6">
    <div><p className="font-mono text-xs uppercase tracking-[.2em] text-ash">Organization administration</p><h1 className="mt-2 text-4xl font-semibold">{labels[kind]}</h1></div>
    {error&&<div className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
    <form onSubmit={submit} className="grid gap-3 border border-line bg-white p-5 md:grid-cols-4">
      <input required value={code} onChange={e=>setCode(e.target.value)} placeholder="Code" className="border border-line bg-bone px-3 py-2"/>
      <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="border border-line bg-bone px-3 py-2"/>
      {kind==='departments'&&<select required value={branchId} onChange={e=>setBranchId(e.target.value)} className="border border-line bg-bone px-3 py-2"><option value="">Select branch</option>{branches.map(b=><option key={b.id} value={b.id}>{b.branch_name}</option>)}</select>}
      <button className="bg-obsidian px-4 py-2 text-sm text-bone">Add {labels[kind].slice(0,-1)}</button>
    </form>
    <div className="border border-line bg-white">{loading?<p className="p-5 text-ash">Loading…</p>:items.map(item=><div key={item.id} className="flex items-center justify-between border-b border-line p-4 last:border-0"><div><strong>{itemName(item)}</strong><p className="text-xs text-ash">{itemCode(item)} · {item.is_active?'Active':'Inactive'}</p></div><button onClick={()=>void toggle(item)} className="text-sm underline">{item.is_active?'Deactivate':'Reactivate'}</button></div>)}</div>
  </section></main>;
}
