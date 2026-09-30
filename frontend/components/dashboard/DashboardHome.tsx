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
    <DashboardContainer className="dashboard-shell ">
      {/* Overview */}
      <DashboardOverview advisor={data} />

      {/* Quick Actions */}
      <div className="pt-2">
        <QuickActions />
      </div>

      {/* Key metrics */}
      <KPIGrid advisor={data} />

      {/* Portfolio + Client Relationships */}
      <section className="grid items-stretch gap-3 xl:grid-cols-2">
        <PortfolioPerformance />
        <RecentClients />
      </section>

      {/* Schedule + Notifications */}
      <section className="grid items-stretch gap-3 xl:grid-cols-2">
        <TodaySchedule />
        <Notifications />
      </section>

      {/* Transactions */}
      <RecentTransactions />
    </DashboardContainer>
  );
}