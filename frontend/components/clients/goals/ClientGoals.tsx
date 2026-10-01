"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { FinancialGoal, GoalStatus, GoalType } from "@/lib/api";
import { archiveFinancialGoal, createFinancialGoal, getClientGoals, toDisplayGoal, updateFinancialGoal } from "./api";
import { getGroupGoals, getGroupMembers } from "@/lib/api";
import GoalProgressCard from "./GoalProgressCard";
import GoalsSummary from "./GoalsSummary";
import GoalsTable from "./GoalsTable";

interface Props { clientId?: number; groupId?: number }
const emptyForm = {
  title: "", goal_type: "OTHER" as GoalType, target_amount: "", current_amount: "0",
  target_date: "", priority: "3", expected_inflation_rate: "", expected_return_rate: "",
  status: "ACTIVE" as GoalStatus, description: "",
};

export default function ClientGoals({ clientId, groupId }: Props) {
  const [records, setRecords] = useState<FinancialGoal[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadGoals = useCallback(async () => {
    const token = localStorage.getItem("finplan_token");
    if (!token || (!clientId && !groupId)) {
      setError("You are not logged in."); setLoading(false); return;
    }
    try {
      setError("");
      if (groupId) {
        const [owned, members] = await Promise.all([getGroupGoals(token, groupId), getGroupMembers(token, groupId)]);
        const memberRows = await Promise.all(members.members.filter((member) => !member.left_on).map((member) => getClientGoals(token, member.customer_id)));
        setRecords([...owned.goals, ...memberRows.flatMap((row) => row.goals)]);
      } else setRecords((await getClientGoals(token, clientId!)).goals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load goals.");
    } finally { setLoading(false); }
  }, [clientId, groupId]);

  useEffect(() => { void loadGoals(); }, [loadGoals]);
  const goals = useMemo(() => records.map(toDisplayGoal), [records]);
  const target = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const current = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem("finplan_token");
    if (!token) return;
    const payload = {
      goal_type: form.goal_type, title: form.title, description: form.description || null,
      target_amount: Number(form.target_amount), current_amount: Number(form.current_amount || 0),
      target_date: form.target_date, priority: Number(form.priority),
      expected_inflation_rate: form.expected_inflation_rate ? Number(form.expected_inflation_rate) : null,
      expected_return_rate: form.expected_return_rate ? Number(form.expected_return_rate) : null,
      status: form.status,
    };
    try {
      setSaving(true); setError("");
      if (editingId) await updateFinancialGoal(token, editingId, payload);
      else await createFinancialGoal(token, { ...payload, ...(groupId ? { customer_group_id: groupId } : { customer_id: clientId }) });
      setForm(emptyForm); setEditingId(null); await loadGoals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save goal.");
    } finally { setSaving(false); }
  };

  const edit = (goal: FinancialGoal) => {
    setEditingId(goal.id);
    setForm({
      title: goal.title, goal_type: goal.goal_type, target_amount: String(goal.target_amount),
      current_amount: String(goal.current_amount), target_date: goal.target_date,
      priority: String(goal.priority),
      expected_inflation_rate: goal.expected_inflation_rate == null ? "" : String(goal.expected_inflation_rate),
      expected_return_rate: goal.expected_return_rate == null ? "" : String(goal.expected_return_rate),
      status: goal.status, description: goal.description ?? "",
    });
  };

  const archive = async (goalId: number) => {
    if (!confirm("Archive this financial goal?")) return;
    const token = localStorage.getItem("finplan_token");
    if (!token) return;
    try { await archiveFinancialGoal(token, goalId); await loadGoals(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to archive goal."); }
  };

  if (loading) return <p className="text-sm text-ash">Loading goals...</p>;
  const inputClass = "rounded-lg border border-line bg-background px-4 py-3";

  return (
    <div className="space-y-6">
      {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <GoalsSummary total={goals.length} target={target} current={current} />

      <form onSubmit={submit} className="rounded-xl border border-line bg-bone p-6">
        <h2 className="text-lg font-semibold">{editingId ? "Edit Goal" : "Add Goal"}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <input required placeholder="Goal name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
          <select value={form.goal_type} onChange={(e) => setForm({ ...form, goal_type: e.target.value as GoalType })} className={inputClass}>
            <option value="RETIREMENT">Retirement</option><option value="EDUCATION">Education</option>
            <option value="HOME_PURCHASE">Home Purchase</option><option value="WEALTH_CREATION">Wealth Creation</option><option value="OTHER">Other</option>
          </select>
          <input required min="0.01" step="0.01" type="number" placeholder="Target amount" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} className={inputClass} />
          <input min="0" step="0.01" type="number" placeholder="Current funding" value={form.current_amount} onChange={(e) => setForm({ ...form, current_amount: e.target.value })} className={inputClass} />
          <input required type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} className={inputClass} />
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputClass}>
            {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>Priority {value}</option>)}
          </select>
          <input min="0" max="100" step="0.01" type="number" placeholder="Inflation assumption %" value={form.expected_inflation_rate} onChange={(e) => setForm({ ...form, expected_inflation_rate: e.target.value })} className={inputClass} />
          <input min="-100" max="100" step="0.01" type="number" placeholder="Expected return %" value={form.expected_return_rate} onChange={(e) => setForm({ ...form, expected_return_rate: e.target.value })} className={inputClass} />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as GoalStatus })} className={inputClass}>
            <option value="ACTIVE">Active</option><option value="ON_TRACK">On Track</option><option value="NEEDS_ATTENTION">Needs Attention</option><option value="ACHIEVED">Achieved</option><option value="PAUSED">Paused</option><option value="CANCELLED">Cancelled</option>
          </select>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} md:col-span-2 lg:col-span-3`} />
        </div>
        <div className="mt-4 flex gap-3">
          <button disabled={saving} className="rounded-full bg-obsidian px-5 py-2 text-xs uppercase tracking-wider text-bone disabled:opacity-50">{saving ? "Saving..." : editingId ? "Save Goal" : "Add Goal"}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-full border border-line px-5 py-2 text-xs uppercase tracking-wider">Cancel</button>}
        </div>
      </form>

      <div className="grid gap-4 lg:grid-cols-3">
        {records.map((record) => <div key={record.id} className="space-y-2">
          <GoalProgressCard goal={toDisplayGoal(record)} />
          <div className="flex gap-3 px-1 text-xs uppercase tracking-wider">
            <button onClick={() => edit(record)} className="u-link">Edit</button>
            <button onClick={() => void archive(record.id)} className="text-red-700">Archive</button>
          </div>
        </div>)}
      </div>
      <GoalsTable goals={goals} />
    </div>
  );
}
