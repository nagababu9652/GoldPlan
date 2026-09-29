"use client";

import type { AdvisorDashboard } from "@/lib/api";

interface AdvisorSnapshotProps {
  advisor: AdvisorDashboard;
}

function formatCurrency(value?: number | null) {
  if (value == null) return "₹0";

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }

  return `₹${value.toLocaleString("en-IN")}`;
}

export default function AdvisorSnapshot({
  advisor,
}: AdvisorSnapshotProps) {
  const portfolioChange =
    advisor.portfolio_change ?? 0;

  const satisfaction =
    advisor.client_satisfaction ?? 0;

  const portfolioValue =
    advisor.total_aum ??
    advisor.portfolio_value ??
    0;

  return (
    <section className="dashboard-panel flex flex-col bg-bone/80 p-6 lg:p-7">
      <div className="flex items-center justify-between">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Today&apos;s Snapshot
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-600/20 bg-emerald-500/10 text-emerald-700">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-mono uppercase tracking-[0.22em] text-ash">
          Assets under management
        </p>

        <div className="mt-2 flex items-end justify-between gap-4">
          <p className="font-serif text-[32px] leading-none tracking-tight text-obsidian">
            {formatCurrency(portfolioValue)}
          </p>

          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
              portfolioChange >= 0
                ? "border-emerald-700/20 bg-emerald-500/10 text-emerald-700"
                : "border-red-600/20 bg-red-500/10 text-red-600"
            }`}
          >
            {portfolioChange >= 0 ? "+" : ""}
            {portfolioChange}%
          </span>
        </div>

        <p className="mt-1 text-xs text-ash">
          vs last month
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 border-y border-line py-5">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-ash">
            Reviews
          </p>

          <p className="mt-2 font-serif text-xl text-obsidian">
            {advisor.reviews_completed ?? 0}
          </p>
        </div>

        <div className="border-l border-line pl-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-ash">
            Upcoming
          </p>

          <p className="mt-2 font-serif text-xl text-obsidian">
            {advisor.upcoming_reviews ?? 0}
          </p>
        </div>

        <div className="border-l border-line pl-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-ash">
            New clients
          </p>

          <p className="mt-2 font-serif text-xl text-obsidian">
            {advisor.new_clients_this_month ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-ash">
            Client satisfaction
          </span>

          <span className="font-serif text-base text-obsidian">
            {satisfaction}
            <span className="ml-1 text-xs text-ash">
              / 5.0
            </span>
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-ash/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-obsidian via-obsidian to-antique transition-all duration-500"
            style={{
              width: `${Math.min(
                Math.max(
                  (Number(satisfaction) / 5) * 100,
                  0
                ),
                100
              )}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}