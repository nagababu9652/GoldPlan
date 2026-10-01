"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ClientPortfolio from "@/components/clients/portfolio/ClientPortfolio";
import { Holding } from "@/components/clients/portfolio/portfolio-types";
import {
  FinancialAccount, InvestmentHolding, archiveHolding, createHolding,
  getAccountHoldings, getClientFinancialAccounts, updateHolding,
} from "@/lib/api";

export default function PortfolioPage() {
  const { id } = useParams<{ id: string }>();
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [raw, setRaw] = useState<InvestmentHolding[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const token = typeof window === "undefined" ? null : localStorage.getItem("finplan_token");

  const load = useCallback(async () => {
    if (!token) { setError("You are not logged in."); setLoading(false); return; }
    try {
      const accountRows = (await getClientFinancialAccounts(token, Number(id))).accounts;
      setAccounts(accountRows);
      const responses = await Promise.all(accountRows.map((account) => getAccountHoldings(token, account.id)));
      setRaw(responses.flatMap((response) => response.holdings));
      setError("");
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load portfolio."); }
    finally { setLoading(false); }
  }, [token, id]);
  useEffect(() => { void load(); }, [load]);

  const askNumber = (label: string, initial = "0") => {
    const value = prompt(label, initial); return value === null ? null : Number(value);
  };
  const add = async () => {
    if (!token || accounts.length === 0) return;
    const accountValue = prompt(`Account ID (${accounts.map((a) => `${a.id}: ${a.account_name}`).join(", ")})`, String(accounts[0].id));
    const name = prompt("Security name"); const type = prompt("Security type", "MUTUAL_FUND");
    const quantity = askNumber("Quantity"); const cost = askNumber("Average cost"); const price = askNumber("Current price");
    if (!accountValue || !name || !type || quantity === null || cost === null || price === null) return;
    try {
      await createHolding(token, { financial_account_id: Number(accountValue), security_type: type,
        security_name: name, quantity, average_cost: cost, current_price: price });
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to add holding."); }
  };
  const edit = async (holding: InvestmentHolding) => {
    if (!token) return;
    const quantity = askNumber("Quantity", String(holding.quantity));
    const cost = askNumber("Average cost", String(holding.average_cost));
    const price = askNumber("Current price", String(holding.current_price));
    if (quantity === null || cost === null || price === null) return;
    try { await updateHolding(token, holding.id, { quantity, average_cost: cost, current_price: price }); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to update holding."); }
  };
  const remove = async (holding: InvestmentHolding) => {
    if (!token || !confirm(`Archive ${holding.security_name}?`)) return;
    try { await archiveHolding(token, holding.id); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to archive holding."); }
  };
  const holdings: Holding[] = raw.map((h) => ({ id: String(h.id), fundName: h.security_name,
    category: h.security_type.replace(/_/g, " "), folioNumber: h.folio_number ?? h.symbol ?? "—",
    units: Number(h.quantity), nav: Number(h.current_price), currentValue: Number(h.current_value),
    investedValue: Number(h.invested_value), gain: Number(h.gain), gainPercent: Number(h.gain_percentage) }));

  if (loading) return <p className="text-sm text-ash">Loading portfolio...</p>;
  return <div className="space-y-4">
    {error && <p className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="flex justify-end"><button onClick={() => void add()} disabled={accounts.length === 0} className="rounded-full bg-obsidian px-5 py-2 text-xs uppercase tracking-wider text-bone disabled:opacity-50">Add Holding</button></div>
    {accounts.length === 0 && <p className="text-sm text-ash">Add an investment financial account before adding holdings.</p>}
    <ClientPortfolio holdings={holdings} />
    {raw.length > 0 && <div className="rounded-xl border border-line bg-bone p-4"><h3 className="font-semibold">Manage Holdings</h3>{raw.map((holding) => <div key={holding.id} className="flex items-center justify-between border-b border-line py-3 last:border-0"><span>{holding.security_name}</span><span><button onClick={() => void edit(holding)} className="mr-4 u-link">Edit</button><button onClick={() => void remove(holding)} className="text-red-700">Archive</button></span></div>)}</div>}
  </div>;
}
