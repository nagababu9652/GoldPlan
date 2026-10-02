"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CashFlowReport,
  FinancialSummaryReport,
  ReportSnapshot,
  ReportSnapshotSummary,
  createReportSnapshot,
  getCashFlowReport,
  getFinancialSummaryReport,
  getReportSnapshot,
  listReportSnapshots,
} from "@/lib/api";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export default function ReportsPage() {
  const [report, setReport] = useState<FinancialSummaryReport | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowReport | null>(null);
  const [snapshots, setSnapshots] = useState<ReportSnapshotSummary[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<ReportSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const snapshotKeyRef = useRef<string | null>(null);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    const token = localStorage.getItem("finplan_token");
    if (!token) {
      setError("Please sign in again to view reports.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const [financialReport, cashFlowReport, savedReports] = await Promise.all([
        getFinancialSummaryReport(token),
        getCashFlowReport(token),
        listReportSnapshots(token),
      ]);
      setReport(financialReport);
      setCashFlow(cashFlowReport);
      setSnapshots(savedReports.reports);
      setSelectedSnapshot(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const saveSnapshot = async () => {
    const token = localStorage.getItem("finplan_token");
    if (!token || !report || !cashFlow || savingRef.current) return;
    savingRef.current = true;
    try {
      setSaving(true);
      setError("");
      snapshotKeyRef.current ??= crypto.randomUUID();
      const snapshot = await createReportSnapshot(token, undefined, snapshotKeyRef.current);
      snapshotKeyRef.current = null;
      setSnapshots((current) => [snapshot, ...current]);
      setSelectedSnapshot(snapshot);
      setReport(snapshot.payload.financial_summary);
      setCashFlow(snapshot.payload.cash_flow);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save report");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const openSnapshot = async (snapshotId: number) => {
    const token = localStorage.getItem("finplan_token");
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const snapshot = await getReportSnapshot(token, snapshotId);
      setSelectedSnapshot(snapshot);
      setReport(snapshot.payload.financial_summary);
      setCashFlow(snapshot.payload.cash_flow);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to open saved report");
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!report || !cashFlow) return;
    const rows: Array<Array<string | number>> = [
      ["FinPlan Financial Snapshot"],
      ["Report date", report.report_date],
      ["Cash-flow period", cashFlow.period_start, cashFlow.period_end],
      [],
      ["Summary", "Amount"],
      ["Assets", report.total_assets],
      ["Liabilities", report.total_liabilities],
      ["Net worth", report.net_worth],
      ["Invested value", report.invested_value],
      ["Current value", report.current_value],
      ["Unrealized gain", report.unrealized_gain],
      ["Goal funding", report.goal_funding],
      ["Goal target", report.goal_target],
      [],
      ["Client", "Assets", "Liabilities", "Net worth", "Invested value", "Current value", "Unrealized gain", "Goal funding", "Goal target"],
      ...report.clients.map((client) => [
        client.customer_name, client.assets, client.liabilities, client.net_worth,
        client.invested_value, client.current_value, client.unrealized_gain,
        client.goal_funding, client.goal_target,
      ]),
      [],
      ["Month", "Inflows", "Outflows", "Net cash flow"],
      ...cashFlow.months.map((month) => [
        month.month, month.inflows, month.outflows, month.net_cash_flow,
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `finplan-financial-report-${selectedSnapshot?.id ?? "live"}-${report.report_date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <section className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">Reporting</div>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
          Financial snapshot
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ash">
          {selectedSnapshot
            ? "An immutable saved report. Its values will not change when current financial data changes."
            : "A live, advisor-scoped report calculated from active client accounts, holdings, and goals."}
        </p>
        {report && (
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <p className="text-xs font-mono uppercase tracking-wider2 text-ash">
              As of {report.report_date}
            </p>
            <button
              type="button"
              onClick={downloadCsv}
              disabled={!cashFlow}
              className="rounded-full border border-obsidian px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-obsidian transition-colors hover:bg-bone-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              Download CSV
            </button>
            {!selectedSnapshot && (
              <button
                type="button"
                onClick={saveSnapshot}
                disabled={saving || !cashFlow}
                className="rounded-full bg-obsidian px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-bone transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Version"}
              </button>
            )}
            {selectedSnapshot && (
              <button
                type="button"
                onClick={() => void loadReport()}
                className="rounded-full border border-obsidian px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-obsidian transition-colors hover:bg-bone-deep"
              >
                Return to Live Report
              </button>
            )}
          </div>
        )}
      </section>

      {loading && <div className="dashboard-panel p-6 text-sm text-ash">Loading financial report...</div>}
      {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className="dashboard-panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl text-obsidian">Saved versions</h2>
            <p className="mt-1 text-sm text-ash">Stored report values and assumptions are preserved at generation time.</p>
          </div>
          <span className="text-xs font-mono uppercase tracking-wider2 text-ash">{snapshots.length} saved</span>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {snapshots.map((snapshot) => (
            <button
              key={snapshot.id}
              type="button"
              onClick={() => void openSnapshot(snapshot.id)}
              className={`border p-4 text-left transition-colors hover:bg-bone-deep ${
                selectedSnapshot?.id === snapshot.id ? "border-obsidian bg-bone-deep" : "border-line"
              }`}
            >
              <span className="block font-medium text-obsidian">{snapshot.title}</span>
              <span className="mt-1 block text-xs text-ash">
                Report date {snapshot.report_date} · Saved {new Date(snapshot.created_at).toLocaleString("en-IN")}
              </span>
            </button>
          ))}
          {!loading && snapshots.length === 0 && <p className="text-sm text-ash">No saved report versions yet.</p>}
        </div>
      </section>

      {selectedSnapshot && (
        <section className="dashboard-panel p-5">
          <h2 className="font-serif text-2xl text-obsidian">Calculation assumptions</h2>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            {Object.entries(selectedSnapshot.assumptions).map(([key, value]) => (
              <div key={key} className="border border-line p-3">
                <dt className="text-[11px] font-mono uppercase tracking-wider2 text-ash">{key.replace(/_/g, " ")}</dt>
                <dd className="mt-1 text-sm text-obsidian">{Array.isArray(value) ? value.join(", ") : String(value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {report && !loading && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Clients", String(report.client_count)],
              ["Assets", money.format(report.total_assets)],
              ["Liabilities", money.format(report.total_liabilities)],
              ["Net worth", money.format(report.net_worth)],
              ["Invested value", money.format(report.invested_value)],
              ["Current value", money.format(report.current_value)],
              ["Unrealized gain", money.format(report.unrealized_gain)],
              ["Goal funding", `${money.format(report.goal_funding)} / ${money.format(report.goal_target)}`],
            ].map(([label, value]) => (
              <div key={label} className="dashboard-panel p-5">
                <p className="text-[11px] font-mono uppercase tracking-wider2 text-ash">{label}</p>
                <p className="mt-2 text-xl font-medium text-obsidian">{value}</p>
              </div>
            ))}
          </section>

          <section className="dashboard-panel overflow-hidden">
            <div className="border-b border-line p-5">
              <h2 className="font-serif text-2xl text-obsidian">Client breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-line bg-bone-deep text-[11px] font-mono uppercase tracking-wider2 text-ash">
                  <tr>
                    <th className="p-4">Client</th><th>Assets</th><th>Liabilities</th>
                    <th>Net worth</th><th>Portfolio</th><th>Gain</th><th>Goal funding</th>
                  </tr>
                </thead>
                <tbody>
                  {report.clients.map((client) => (
                    <tr key={client.customer_id} className="border-b border-line last:border-0">
                      <td className="p-4 font-medium">
                        <Link className="u-link" href={`/advisor-dashboard/clients/${client.customer_id}`}>
                          {client.customer_name}
                        </Link>
                      </td>
                      <td>{money.format(client.assets)}</td>
                      <td>{money.format(client.liabilities)}</td>
                      <td>{money.format(client.net_worth)}</td>
                      <td>{money.format(client.current_value)}</td>
                      <td>{money.format(client.unrealized_gain)}</td>
                      <td>{money.format(client.goal_funding)} / {money.format(client.goal_target)}</td>
                    </tr>
                  ))}
                  {report.clients.length === 0 && (
                    <tr><td className="p-6 text-center text-ash" colSpan={7}>No active assigned clients found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {cashFlow && (
            <section className="dashboard-panel overflow-hidden">
              <div className="border-b border-line p-5">
                <h2 className="font-serif text-2xl text-obsidian">Investment cash flow</h2>
                <p className="mt-1 text-sm text-ash">
                  Completed transactions from {cashFlow.period_start} through {cashFlow.period_end}.
                  Sells are inflows and buys are outflows.
                </p>
              </div>
              <div className="grid gap-3 border-b border-line p-5 sm:grid-cols-3">
                <div><p className="text-xs uppercase tracking-wider2 text-ash">Inflows</p><p className="mt-1 text-xl">{money.format(cashFlow.total_inflows)}</p></div>
                <div><p className="text-xs uppercase tracking-wider2 text-ash">Outflows</p><p className="mt-1 text-xl">{money.format(cashFlow.total_outflows)}</p></div>
                <div><p className="text-xs uppercase tracking-wider2 text-ash">Net flow</p><p className="mt-1 text-xl">{money.format(cashFlow.net_cash_flow)}</p></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-line bg-bone-deep text-[11px] font-mono uppercase tracking-wider2 text-ash">
                    <tr><th className="p-4">Month</th><th>Inflows</th><th>Outflows</th><th>Net flow</th></tr>
                  </thead>
                  <tbody>
                    {cashFlow.months.map((month) => (
                      <tr key={month.month} className="border-b border-line last:border-0">
                        <td className="p-4 font-medium">{new Date(`${month.month}T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</td>
                        <td>{money.format(month.inflows)}</td>
                        <td>{money.format(month.outflows)}</td>
                        <td>{money.format(month.net_cash_flow)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
