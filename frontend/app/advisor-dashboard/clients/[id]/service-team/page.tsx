"use client";

import { use, useCallback, useEffect, useState } from "react";
import { EmployeeOption, ServiceTeamMember, addClientServiceTeamMember, getClientServiceTeam, getServiceTeamEmployees, removeClientServiceTeamMember } from "@/lib/api";

export default function ServiceTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const clientId = Number(id);
  const [members, setMembers] = useState<ServiceTeamMember[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [employeeId, setEmployeeId] = useState(""); const [role, setRole] = useState("PARAPLANNER");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    const token = localStorage.getItem("finplan_token"); if (!token) return;
    try { const [team, options] = await Promise.all([getClientServiceTeam(token, clientId), getServiceTeamEmployees(token, clientId)]); setMembers(team); setEmployees(options); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to load service team"); }
  }, [clientId]);
  useEffect(() => { void load(); }, [load]);
  async function add() {
    const token = localStorage.getItem("finplan_token"); if (!token || !employeeId) return;
    try { await addClientServiceTeamMember(token, clientId, Number(employeeId), role); setEmployeeId(""); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to assign employee"); }
  }
  async function remove(member: ServiceTeamMember) {
    const token = localStorage.getItem("finplan_token"); if (!token) return;
    try { await removeClientServiceTeamMember(token, clientId, member.assignment_id); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to remove assignment"); }
  }
  return <div className="space-y-4"><section className="dashboard-panel p-6">
    <h1 className="font-serif text-3xl">Service Team</h1><p className="mt-2 text-sm text-ash">Assign paraplanning, operations, and compliance support.</p>
    {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    <div className="mt-5 flex flex-wrap gap-3"><select className="dashboard-form-control max-w-sm" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}><option value="">Select employee...</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.display_name} ({employee.employee_code})</option>)}</select>
      <select className="dashboard-form-control max-w-xs" value={role} onChange={(e) => setRole(e.target.value)}>{["PARAPLANNER","OPERATIONS","COMPLIANCE"].map((value) => <option key={value}>{value}</option>)}</select>
      <button onClick={() => void add()} disabled={!employeeId} className="rounded-full bg-obsidian px-5 py-2 text-sm text-bone disabled:opacity-50">Assign</button></div>
  </section><section className="dashboard-panel p-6"><div className="space-y-2">{members.map((member) => <div key={member.assignment_id} className="flex items-center justify-between border border-line p-4"><div><strong>{member.employee_name}</strong><p className="text-xs text-ash">{member.role} · since {member.effective_from}</p></div>{member.role !== "ADVISOR" && <button onClick={() => void remove(member)} className="text-sm text-red-600">Remove</button>}</div>)}{members.length === 0 && <p className="text-sm text-ash">No service-team assignments.</p>}</div></section></div>;
}
