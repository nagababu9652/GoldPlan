'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSingleSubmission } from '@/lib/use-single-submission';
import {
  bulkSetAdminEmployeeActive, createAdminEmployee, listAdminBranches, listAdminDepartments, listAdminDesignations, listAdminEmployees,
  setAdminEmployeeActive, type AdminBranch, type AdminDepartment, type AdminDesignation, type AdminEmployee,
  type AdminEmployeeInput,
} from '@/lib/api';

const emptyForm:AdminEmployeeInput={employee_code:'',first_name:'',last_name:'',official_email:'',branch_id:0,department_id:0,designation_id:0,employment_type:'FULL_TIME',joining_date:new Date().toISOString().slice(0,10)};

export default function EmployeesPage(){
  const router=useRouter(); const [employees,setEmployees]=useState<AdminEmployee[]>([]); const [branches,setBranches]=useState<AdminBranch[]>([]);
  const {run,submitting,keyFor,clearKey}=useSingleSubmission();
  const [departments,setDepartments]=useState<AdminDepartment[]>([]); const [designations,setDesignations]=useState<AdminDesignation[]>([]);
  const [managerOptions,setManagerOptions]=useState<AdminEmployee[]>([]); const [search,setSearch]=useState(''); const [statusFilter,setStatusFilter]=useState('all'); const [branchFilter,setBranchFilter]=useState('');
  const [form,setForm]=useState<AdminEmployeeInput>(emptyForm); const [showForm,setShowForm]=useState(false); const [selected,setSelected]=useState<number[]>([]); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [loading,setLoading]=useState(true);
  const token=()=>localStorage.getItem('finplan_token')||'';
  const load=useCallback(async()=>{const t=token();if(!t){router.replace('/login');return;}setLoading(true);try{const [e,all,b,d,g]=await Promise.all([listAdminEmployees(t,true,{search:search.trim()||undefined,employment_status:statusFilter==='all'?undefined:statusFilter,branch_id:branchFilter?Number(branchFilter):undefined}),listAdminEmployees(t),listAdminBranches(t),listAdminDepartments(t),listAdminDesignations(t)]);setEmployees(e);setManagerOptions(all.filter(x=>x.is_active));setBranches(b.filter(x=>x.is_active));setDepartments(d.filter(x=>x.is_active));setDesignations(g.filter(x=>x.is_active));}catch(reason){setError(reason instanceof Error?reason.message:'Unable to load employees');}finally{setLoading(false);}},[router,search,statusFilter,branchFilter]);
  useEffect(()=>{const timer=setTimeout(()=>void load(),300);return()=>clearTimeout(timer);},[load]);
  const filteredDepartments=useMemo(()=>departments.filter(x=>!form.branch_id||x.branch_id===form.branch_id),[departments,form.branch_id]);
  function field<K extends keyof AdminEmployeeInput>(key:K,value:AdminEmployeeInput[K]){setForm(current=>({...current,[key]:value}));}
  async function submit(event:FormEvent){event.preventDefault();await run(async()=>{setError('');try{await createAdminEmployee(token(),form,keyFor(form));clearKey();setForm(emptyForm);setShowForm(false);await load();}catch(reason){setError(reason instanceof Error?reason.message:'Unable to create employee');}});}
  async function toggle(item:AdminEmployee){setError('');try{await setAdminEmployeeActive(token(),item.id,!item.is_active);await load();}catch(reason){setError(reason instanceof Error?reason.message:'Unable to update employee');}}
  function toggleSelected(id:number){setSelected(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]);}
  async function bulkChange(active:boolean){const ids=employees.filter(item=>selected.includes(item.id)&&item.is_active!==active).map(item=>item.id);if(!ids.length)return;setBusy(true);setError('');try{await bulkSetAdminEmployeeActive(token(),ids,active);setSelected([]);await load();}catch(reason){setError(reason instanceof Error?reason.message:'Unable to update selected employees');}finally{setBusy(false);}}
  const inputClass='border border-line bg-bone px-3 py-2 text-sm';
  return <main className="min-h-screen bg-bone px-6 py-12 text-obsidian"><section className="mx-auto max-w-6xl space-y-6">
    <div className="flex items-end justify-between"><div><p className="font-mono text-xs uppercase tracking-[.2em] text-ash">Organization administration</p><h1 className="mt-2 text-4xl font-semibold">Employees</h1></div><button onClick={()=>setShowForm(value=>!value)} className="bg-obsidian px-5 py-3 text-sm text-bone">{showForm?'Cancel':'Add employee'}</button></div>
    <div className="border border-line bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-medium">Find employees</h2>{(search||statusFilter!=='all'||branchFilter)&&<button type="button" onClick={()=>{setSearch('');setStatusFilter('all');setBranchFilter('');}} className="text-sm underline">Clear filters</button>}</div>
      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-ash md:col-span-2" htmlFor="employee-search">Search employees
          <input id="employee-search" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, code, email or phone" className={inputClass}/>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-ash" htmlFor="employee-status">Status
          <select id="employee-status" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className={inputClass}><option value="all">All statuses</option><option value="ACTIVE">Active</option><option value="ON_LEAVE">On leave</option><option value="RELIEVED">Relieved</option><option value="INACTIVE">Inactive</option></select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-ash" htmlFor="employee-branch">Branch
          <select id="employee-branch" value={branchFilter} onChange={e=>setBranchFilter(e.target.value)} className={inputClass}><option value="">All branches</option>{branches.map(x=><option key={x.id} value={x.id}>{x.branch_name}</option>)}</select>
        </label>
      </div>
      {!loading&&<p className="mt-3 text-sm text-ash" aria-live="polite">{employees.length} {employees.length===1?'employee':'employees'} found</p>}
    </div>
    {error&&<div className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
    {showForm&&<form onSubmit={submit} className="grid gap-4 border border-line bg-white p-6 md:grid-cols-3">
      <input required placeholder="Employee code" value={form.employee_code} onChange={e=>field('employee_code',e.target.value)} className={inputClass}/>
      <input required placeholder="First name" value={form.first_name} onChange={e=>field('first_name',e.target.value)} className={inputClass}/>
      <input placeholder="Last name" value={form.last_name||''} onChange={e=>field('last_name',e.target.value)} className={inputClass}/>
      <input required type="email" placeholder="Official email" value={form.official_email} onChange={e=>field('official_email',e.target.value)} className={inputClass}/>
      <input type="tel" placeholder="Official mobile" value={form.official_mobile||''} onChange={e=>field('official_mobile',e.target.value)} className={inputClass}/>
      <input required type="date" aria-label="Joining date" value={form.joining_date} onChange={e=>field('joining_date',e.target.value)} className={inputClass}/>
      <select required value={form.branch_id||''} onChange={e=>{field('branch_id',Number(e.target.value));field('department_id',0);}} className={inputClass}><option value="">Branch</option>{branches.map(x=><option key={x.id} value={x.id}>{x.branch_name}</option>)}</select>
      <select required value={form.department_id||''} onChange={e=>field('department_id',Number(e.target.value))} className={inputClass}><option value="">Department</option>{filteredDepartments.map(x=><option key={x.id} value={x.id}>{x.department_name}</option>)}</select>
      <select required value={form.designation_id||''} onChange={e=>field('designation_id',Number(e.target.value))} className={inputClass}><option value="">Designation</option>{designations.map(x=><option key={x.id} value={x.id}>{x.designation_name}</option>)}</select>
      <select value={form.employment_type} onChange={e=>field('employment_type',e.target.value)} className={inputClass}><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option><option value="CONTRACT">Contract</option><option value="INTERN">Intern</option><option value="CONSULTANT">Consultant</option></select>
      <select value={form.reporting_manager_employee_id||''} onChange={e=>field('reporting_manager_employee_id',e.target.value?Number(e.target.value):null)} className={inputClass}><option value="">No reporting manager</option>{managerOptions.map(x=><option key={x.id} value={x.id}>{x.display_name}</option>)}</select>
      <button disabled={submitting} className="bg-obsidian px-4 py-2 text-sm text-bone disabled:cursor-not-allowed disabled:opacity-50">{submitting?'Creating…':'Create employee'}</button>
    </form>}
    <div className="flex flex-wrap items-center gap-3"><span className="text-sm text-ash">{selected.length} selected</span><button type="button" disabled={busy||!employees.some(item=>selected.includes(item.id)&&item.is_active)} onClick={()=>void bulkChange(false)} className="border border-line bg-white px-3 py-2 text-sm disabled:opacity-50">Deactivate selected</button><button type="button" disabled={busy||!employees.some(item=>selected.includes(item.id)&&!item.is_active)} onClick={()=>void bulkChange(true)} className="border border-line bg-white px-3 py-2 text-sm disabled:opacity-50">Reactivate selected</button></div><div className="overflow-x-auto border border-line bg-white"><table className="w-full text-left text-sm"><thead className="border-b border-line bg-bone-deep text-xs uppercase tracking-wider text-ash"><tr><th className="p-4">Select</th><th className="p-4">Employee</th><th className="p-4">Code</th><th className="p-4">Employment</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody>{loading?<tr><td colSpan={6} className="p-5 text-ash">Loading…</td></tr>:employees.map(item=><tr key={item.id} className="border-b border-line last:border-0"><td className="p-4"><input type="checkbox" checked={selected.includes(item.id)} onChange={()=>toggleSelected(item.id)} aria-label={`Select ${item.display_name}`}/></td><td className="p-4"><Link className="font-medium underline" href={`/admin/organization/employees/${item.id}`}>{item.display_name}</Link><p className="text-xs text-ash">{item.official_email}</p></td><td className="p-4">{item.employee_code}</td><td className="p-4">{item.employment_type.replace(/_/g,' ')}</td><td className="p-4">{item.is_active?item.employment_status:'INACTIVE'}</td><td className="p-4"><div className="flex gap-4"><Link href={`/admin/organization/employees/${item.id}`} className="underline">Edit</Link><button onClick={()=>void toggle(item)} className="underline">{item.is_active?'Deactivate':'Reactivate'}</button></div></td></tr>)}</tbody></table></div>
  </section></main>;
}
