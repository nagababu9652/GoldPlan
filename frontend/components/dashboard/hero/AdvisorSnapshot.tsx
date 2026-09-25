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
    <section className="flex flex-col rounded-2xl border border-line bg-bone p-6 lg:p-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="label-mono text-ash">
          TODAY'S SNAPSHOT
        </div>

        <div className="h-2 w-2 rounded-full bg-emerald-600" />
      </div>

      {/* AUM */}
      <div className="mt-6">
        <p className="text-xs font-mono uppercase tracking-wider text-ash">
          Assets under management
        </p>

        <div className="mt-2 flex items-end justify-between gap-4">
          <p className="font-serif text-[32px] leading-none tracking-tight text-obsidian">
            {formatCurrency(portfolioValue)}
          </p>

          <span
            className={`pb-0.5 text-xs font-medium ${
              portfolioChange >= 0
                ? "text-emerald-700"
                : "text-red-600"
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

      {/* Metrics */}
      <div className="mt-6 grid grid-cols-3 border-y border-line py-5">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-ash">
            Reviews
          </p>

          <p className="mt-2 font-serif text-xl text-obsidian">
            {advisor.reviews_completed ?? 0}
          </p>
        </div>

        <div className="border-l border-line pl-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-ash">
            Upcoming
          </p>

          <p className="mt-2 font-serif text-xl text-obsidian">
            {advisor.upcoming_reviews ?? 0}
          </p>
        </div>

        <div className="border-l border-line pl-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-ash">
            New clients
          </p>

          <p className="mt-2 font-serif text-xl text-obsidian">
            {advisor.new_clients_this_month ?? 0}
          </p>
        </div>
      </div>

      {/* Satisfaction */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ash">
            Client satisfaction
          </span>

          <span className="font-serif text-base text-obsidian">
            {satisfaction}
            <span className="ml-1 text-xs text-ash">
              / 5.0
            </span>
          </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ash/10">
          <div
            className="h-full rounded-full bg-obsidian transition-all duration-500"
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