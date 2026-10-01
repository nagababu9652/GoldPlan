"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ClientPortfolio from "@/components/clients/portfolio/ClientPortfolio";
import { Holding } from "@/components/clients/portfolio/portfolio-types";
import { getAccountHoldings, getClientFinancialAccounts, getGroupFinancialAccounts, getGroupMembers } from "@/lib/api";
export default function GroupPortfolioPage() {
  const { id } = useParams<{ id: string }>(); const [holdings, setHoldings] = useState<Holding[]>([]); const [error, setError] = useState("");
  useEffect(() => { const token = localStorage.getItem("finplan_token"); if (!token) return;
    Promise.all([getGroupFinancialAccounts(token, Number(id)), getGroupMembers(token, Number(id))]).then(async ([groupAccounts, members]) => {
      const memberAccounts = await Promise.all(members.members.filter((m) => !m.left_on).map((m) => getClientFinancialAccounts(token, m.customer_id)));
      const accounts = [...groupAccounts.accounts, ...memberAccounts.flatMap((r) => r.accounts)];
      const rows = await Promise.all(accounts.map((a) => getAccountHoldings(token, a.id)));
      setHoldings(rows.flatMap((r) => r.holdings.map((h) => ({ id: String(h.id), fundName: h.security_name, category: h.security_type.replace(/_/g, " "), folioNumber: h.folio_number ?? h.symbol ?? "—", units: Number(h.quantity), nav: Number(h.current_price), currentValue: Number(h.current_value), investedValue: Number(h.invested_value), gain: Number(h.gain), gainPercent: Number(h.gain_percentage) }))));
    }).catch((err) => setError(err instanceof Error ? err.message : "Failed to load household portfolio."));
  }, [id]);
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  return <ClientPortfolio holdings={holdings} />;
}
