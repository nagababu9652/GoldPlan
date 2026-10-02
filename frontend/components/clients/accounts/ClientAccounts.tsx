"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FinancialAccount, FinancialAccountStatus, FinancialAccountType,
  archiveFinancialAccount, createFinancialAccount,
  getClientFinancialAccounts, getGroupFinancialAccounts, getGroupMembers, updateFinancialAccount,
} from "@/lib/api";

const accountTypes: FinancialAccountType[] = [
  "BANK", "CASH", "MUTUAL_FUND_FOLIO", "BROKERAGE_DEMAT", "FIXED_DEPOSIT",
  "PPF", "EPF", "NPS", "INSURANCE_CASH_VALUE", "LOAN", "OTHER",
];
const emptyForm = {
  account_type: "BANK" as FinancialAccountType, account_name: "", institution_name: "",
  account_number_masked: "", currency_code: "INR", current_balance: "0",
  valuation_as_of: "", opened_on: "", maturity_date: "", interest_rate: "",
  status: "ACTIVE" as FinancialAccountStatus, remarks: "",
};
const inputClass = "rounded-lg border border-line bg-background px-4 py-3";

export default function ClientAccounts({ clientId, groupId }: { clientId?: number; groupId?: number }) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const createKeyRef = useRef<{ payload: string; key: string } | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const token = localStorage.getItem("finplan_token");
    if (!token || (!clientId && !groupId)) { setError("You are not logged in."); setLoading(false); return; }
    try {
      setError("");
      if (groupId) {
        const [owned, members] = await Promise.all([getGroupFinancialAccounts(token, groupId), getGroupMembers(token, groupId)]);
        const memberRows = await Promise.all(members.members.filter((member) => !member.left_on).map((member) => getClientFinancialAccounts(token, member.customer_id)));
        setAccounts([...owned.accounts, ...memberRows.flatMap((row) => row.accounts)]);
      } else setAccounts((await getClientFinancialAccounts(token, clientId!)).accounts);
    }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to load accounts."); }
    finally { setLoading(false); }
  }, [clientId, groupId]);

  useEffect(() => { void load(); }, [load]);
  const totals = useMemo(() => accounts.reduce((value, account) => {
    const amount = Number(account.current_balance);
    return account.account_nature === "LIABILITY"
      ? { ...value, liabilities: value.liabilities + amount }
      : { ...value, assets: value.assets + amount };
  }, { assets: 0, liabilities: 0 }), [accounts]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (savingRef.current) return;
    const token = localStorage.getItem("finplan_token"); if (!token) return;
    const payload = {
      account_type: form.account_type, account_name: form.account_name,
      institution_name: form.institution_name || null,
      account_number_masked: form.account_number_masked || null,
      currency_code: form.currency_code, current_balance: Number(form.current_balance || 0),
      valuation_as_of: form.valuation_as_of || null, opened_on: form.opened_on || null,
      maturity_date: form.maturity_date || null,
      interest_rate: form.interest_rate ? Number(form.interest_rate) : null,
      status: form.status, remarks: form.remarks || null,
    };
    savingRef.current = true;
    try {
      setSaving(true); setError("");
      if (editingId) await updateFinancialAccount(token, editingId, payload);
      else {
        const createPayload = { ...payload, ...(groupId ? { customer_group_id: groupId } : { customer_id: clientId }) };
        const serialized = JSON.stringify(createPayload);
        if (createKeyRef.current?.payload !== serialized) createKeyRef.current = { payload: serialized, key: crypto.randomUUID() };
        await createFinancialAccount(token, createPayload, createKeyRef.current.key);
        createKeyRef.current = null;
      }
      setEditingId(null); setForm(emptyForm); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save account."); }
    finally { savingRef.current = false; setSaving(false); }
  };

  const edit = (account: FinancialAccount) => {
    setEditingId(account.id);
    setForm({
      account_type: account.account_type, account_name: account.account_name,
      institution_name: account.institution_name ?? "", account_number_masked: account.account_number_masked ?? "",
      currency_code: account.currency_code, current_balance: String(account.current_balance),
      valuation_as_of: account.valuation_as_of ?? "", opened_on: account.opened_on ?? "",
      maturity_date: account.maturity_date ?? "", interest_rate: account.interest_rate == null ? "" : String(account.interest_rate),
      status: account.status, remarks: account.remarks ?? "",
    });
  };

  const archive = async (id: number) => {
    if (!confirm("Archive this financial account?")) return;
    const token = localStorage.getItem("finplan_token"); if (!token) return;
    try { await archiveFinancialAccount(token, id); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to archive account."); }
  };

  if (loading) return <p className="text-sm text-ash">Loading financial accounts...</p>;
  return <div className="space-y-6">
    {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="dashboard-panel p-5"><p className="text-xs uppercase text-ash">Assets</p><p className="mt-2 text-2xl">₹{totals.assets.toLocaleString("en-IN")}</p></div>
      <div className="dashboard-panel p-5"><p className="text-xs uppercase text-ash">Liabilities</p><p className="mt-2 text-2xl">₹{totals.liabilities.toLocaleString("en-IN")}</p></div>
      <div className="dashboard-panel p-5"><p className="text-xs uppercase text-ash">Net</p><p className="mt-2 text-2xl">₹{(totals.assets - totals.liabilities).toLocaleString("en-IN")}</p></div>
    </div>
    <form onSubmit={submit} className="rounded-xl border border-line bg-bone p-6">
      <h2 className="text-lg font-semibold">{editingId ? "Edit Account" : "Add Financial Account"}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <select value={form.account_type} onChange={(e) => setForm({ ...form, account_type: e.target.value as FinancialAccountType })} className={inputClass}>{accountTypes.map((type) => <option key={type} value={type}>{type.replace(/_/g, " ")}</option>)}</select>
        <input required placeholder="Account name" value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} className={inputClass} />
        <input placeholder="Institution" value={form.institution_name} onChange={(e) => setForm({ ...form, institution_name: e.target.value })} className={inputClass} />
        <input placeholder="Masked account number" value={form.account_number_masked} onChange={(e) => setForm({ ...form, account_number_masked: e.target.value })} className={inputClass} />
        <input required maxLength={3} placeholder="Currency" value={form.currency_code} onChange={(e) => setForm({ ...form, currency_code: e.target.value.toUpperCase() })} className={inputClass} />
        <input min="0" step="0.01" type="number" placeholder="Current balance" value={form.current_balance} onChange={(e) => setForm({ ...form, current_balance: e.target.value })} className={inputClass} />
        <label className="text-xs text-ash">Valuation date<input type="date" value={form.valuation_as_of} onChange={(e) => setForm({ ...form, valuation_as_of: e.target.value })} className={`mt-1 w-full ${inputClass}`} /></label>
        <label className="text-xs text-ash">Opened on<input type="date" value={form.opened_on} onChange={(e) => setForm({ ...form, opened_on: e.target.value })} className={`mt-1 w-full ${inputClass}`} /></label>
        <label className="text-xs text-ash">Maturity date<input type="date" value={form.maturity_date} onChange={(e) => setForm({ ...form, maturity_date: e.target.value })} className={`mt-1 w-full ${inputClass}`} /></label>
        <input min="0" max="100" step="0.01" type="number" placeholder="Interest rate %" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} className={inputClass} />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FinancialAccountStatus })} className={inputClass}><option value="ACTIVE">Active</option><option value="CLOSED">Closed</option><option value="MATURED">Matured</option><option value="FROZEN">Frozen</option></select>
        <input placeholder="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className={inputClass} />
      </div>
      <div className="mt-4 flex gap-3"><button disabled={saving} className="rounded-full bg-obsidian px-5 py-2 text-xs uppercase tracking-wider text-bone disabled:opacity-50">{saving ? "Saving..." : editingId ? "Save Account" : "Add Account"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-full border border-line px-5 py-2 text-xs uppercase tracking-wider">Cancel</button>}</div>
    </form>
    <div className="overflow-x-auto rounded-xl border border-line bg-bone"><table className="w-full text-sm"><thead className="border-b border-line text-left text-xs uppercase text-ash"><tr><th className="p-4">Account</th><th className="p-4">Type</th><th className="p-4">Nature</th><th className="p-4">Balance</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody>{accounts.map((account) => <tr key={account.id} className="border-b border-line last:border-0"><td className="p-4"><p className="font-medium">{account.account_name}</p><p className="text-xs text-ash">{account.institution_name || account.account_number_masked || "—"}</p></td><td className="p-4">{account.account_type.replace(/_/g, " ")}</td><td className="p-4">{account.account_nature}</td><td className="p-4">{account.currency_code} {Number(account.current_balance).toLocaleString("en-IN")}</td><td className="p-4">{account.status}</td><td className="p-4"><button onClick={() => edit(account)} className="mr-3 u-link">Edit</button><button onClick={() => void archive(account.id)} className="text-red-700">Archive</button></td></tr>)}</tbody></table>{accounts.length === 0 && <p className="p-8 text-center text-sm text-ash">No financial accounts added.</p>}</div>
  </div>;
}
