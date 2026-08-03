"use client";

import {
  Wallet,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { KPIGrid, KPIWidget } from "@/components/dashboard/widgets/kpi";

interface ClientSummaryProps {
  totalAUM: string;
  portfolioValue: string;
  returns: string;
  goals: number;
}

export default function ClientSummary({
  totalAUM,
  portfolioValue,
  returns,
  goals,
}: ClientSummaryProps) {
  return (
    <KPIGrid>
      <KPIWidget
        title="Total AUM"
        value={totalAUM}
        icon={Wallet}
        color="success"
      />

      <KPIWidget
        title="Portfolio Value"
        value={portfolioValue}
        icon={TrendingUp}
      />

      <KPIWidget
        title="Returns"
        value={returns}
        icon={TrendingUp}
        color="primary"
      />

      <KPIWidget
        title="Goals"
        value={goals}
        icon={Target}
        color="warning"
      />
    </KPIGrid>
  );
}