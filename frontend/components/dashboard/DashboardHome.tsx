"use client";

import { DashboardContainer } from "./layout";
import { DashboardOverview } from "./hero";
import { PortfolioPerformance } from "./charts";
import { KPIGrid } from "./stat-card";

import {
  Notifications,
  RecentClients,
  RecentTransactions,
  TodaySchedule,
  QuickActions,
} from "./widgets";

import { useDashboard } from "./hooks/useDashboard";

export default function DashboardHome() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <DashboardContainer>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-ash">
            Loading dashboard...
          </p>
        </div>
      </DashboardContainer>
    );
  }

  if (error || !data) {
    return (
      <DashboardContainer>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-red-600">
              {error || "Unable to load dashboard."}
            </p>
          </div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-12 lg:space-y-16">
      {/* Overview */}
      <DashboardOverview advisor={data} />

      {/* Quick Actions */}
      <div className="mt-8">
        <QuickActions />
      </div>

      {/* Key metrics */}
      <KPIGrid advisor={data} />

      {/* Portfolio + Schedule */}
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,1fr)]">
        <PortfolioPerformance />
        <TodaySchedule />
      </section>

      {/* Clients + Notifications */}
      <section className="grid items-start gap-8 xl:grid-cols-[2fr_1fr]">
        <RecentClients />
        <Notifications />
      </section>

      {/* Transactions */}
      <RecentTransactions />
    </DashboardContainer>
  );
}