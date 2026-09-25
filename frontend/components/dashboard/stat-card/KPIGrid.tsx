"use client";

import type { AdvisorDashboard } from "@/lib/api";
import {
  BriefcaseBusiness,
  UsersRound,
  TrendingUp,
  CalendarClock,
} from "lucide-react";

import StatCard from "./StatCard";

interface KPIGridProps {
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

export default function KPIGrid({
  advisor,
}: KPIGridProps) {
  const portfolioValue =
    advisor.total_aum ??
    advisor.portfolio_value ??
    0;

  const portfolioChange =
    advisor.portfolio_change ?? 0;

  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Assets Under Management"
        value={formatCurrency(portfolioValue)}
        subtitle="Current portfolio value"
        icon={<BriefcaseBusiness size={21} />}
      />

      <StatCard
        title="Total Clients"
        value={advisor.total_clients ?? 0}
        subtitle={`${advisor.active_clients ?? 0} active clients`}
        icon={<UsersRound size={21} />}
      />

      <StatCard
        title="Portfolio Return"
        value={`${portfolioChange >= 0 ? "+" : ""}${portfolioChange}%`}
        subtitle="vs last month"
        trend={portfolioChange}
        icon={<TrendingUp size={21} />}
      />

      <StatCard
        title="Upcoming Reviews"
        value={advisor.upcoming_reviews ?? 0}
        subtitle="Scheduled reviews"
        icon={<CalendarClock size={21} />}
      />
    </section>
  );
}