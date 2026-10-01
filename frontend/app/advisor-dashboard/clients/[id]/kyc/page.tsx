"use client";

import { use, useCallback, useEffect, useState } from "react";
import { ClientKYC, KYCHistory, getClientKYC, getClientKYCHistory, updateClientKYC } from "@/lib/api";

export default function ClientKYCPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const clientId = Number(id);
  const [kyc, setKyc] = useState<ClientKYC | null>(null);
  const [history, setHistory] = useState<KYCHistory[]>([]);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    const token = localStorage.getItem("finplan_token");
    if (!token) return;
    try {
      const [record, records] = await Promise.all([getClientKYC(token, clientId), getClientKYCHistory(token, clientId)]);
      setKyc(record); setHistory(records);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load KYC"); }
  }, [clientId]);
  useEffect(() => { void load(); }, [load]);
  async function save() {
    const token = localStorage.getItem("finplan_token");
    if (!token || !kyc) return;
    try {
      setError("");
      await updateClientKYC(token, clientId, {
        kyc_status: kyc.kyc_status,
        kyc_verified_date: kyc.kyc_verified_date,
        kyc_expiry_date: kyc.kyc_expiry_date,
        verification_method: kyc.verification_method,
        verification_reference: kyc.verification_reference,
        politically_exposed_person: kyc.politically_exposed_person,
        remarks: kyc.remarks,
        review_reason: reason || undefined,
      });
      setReason(""); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to update KYC"); }
  }
  if (!kyc) return <div className="dashboard-panel p-6">{error || "Loading KYC..."}</div>;
  return <div className="space-y-4">
    <section className="dashboard-panel p-6">
      <h1 className="font-serif text-3xl">KYC & Compliance</h1>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm">Status<select className="dashboard-form-control mt-2" value={kyc.kyc_status} onChange={(e) => setKyc({ ...kyc, kyc_status: e.target.value })}>
          {["PENDING","IN_PROGRESS","VERIFIED","REJECTED","EXPIRED"].map((value) => <option key={value}>{value}</option>)}
        </select></label>
        <label className="text-sm">Verification method<input className="dashboard-form-control mt-2" value={kyc.verification_method ?? ""} onChange={(e) => setKyc({ ...kyc, verification_method: e.target.value || null })} /></label>
        <label className="text-sm">Verified date<input type="date" className="dashboard-form-control mt-2" value={kyc.kyc_verified_date ?? ""} onChange={(e) => setKyc({ ...kyc, kyc_verified_date: e.target.value || null })} /></label>
        <label className="text-sm">Expiry date<input type="date" className="dashboard-form-control mt-2" value={kyc.kyc_expiry_date ?? ""} onChange={(e) => setKyc({ ...kyc, kyc_expiry_date: e.target.value || null })} /></label>
        <label className="text-sm md:col-span-2">Review reason<input className="dashboard-form-control mt-2" value={reason} onChange={(e) => setReason(e.target.value)} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={kyc.politically_exposed_person} onChange={(e) => setKyc({ ...kyc, politically_exposed_person: e.target.checked })} /> Politically exposed person</label>
      </div>
      <button onClick={() => void save()} className="mt-5 rounded-full bg-obsidian px-5 py-2 text-sm text-bone">Save KYC Review</button>
    </section>
    <section className="dashboard-panel p-6"><h2 className="font-serif text-2xl">Review history</h2>
      <div className="mt-4 space-y-2">{history.map((item) => <div key={item.id} className="border border-line p-3 text-sm">
        <strong>{item.previous_status || "NEW"} → {item.new_status}</strong><span className="ml-3 text-ash">{new Date(item.reviewed_on).toLocaleString("en-IN")}</span>
        {item.review_reason && <p className="mt-1 text-ash">{item.review_reason}</p>}
      </div>)}{history.length === 0 && <p className="text-sm text-ash">No KYC reviews recorded.</p>}</div>
    </section>
  </div>;
}
