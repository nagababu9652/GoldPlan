"use client";

import type { Client } from "@/lib/api";
import { Card } from "@/components/ui/card";

interface Props {
  client: Client;
}

function formatCurrency(value?: number | null) {
  if (value == null) return "—";

  return `₹ ${value.toLocaleString("en-IN")}`;
}

export default function ClientSummaryCards({
  client,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="p-5">
        <p className="text-sm text-muted-foreground">
          Net Worth
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          {formatCurrency(client.net_worth)}
        </h2>
      </Card>

      <Card className="p-5">
        <p className="text-sm text-muted-foreground">
          Annual Income
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          {formatCurrency(client.annual_income)}
        </h2>
      </Card>

      <Card className="p-5">
        <p className="text-sm text-muted-foreground">
          Risk Profile
        </p>

        <h2 className="mt-2 text-xl font-semibold">
          {client.risk_profile || "Not set"}
        </h2>
      </Card>

      <Card className="p-5">
        <p className="text-sm text-muted-foreground">
          Occupation
        </p>

        <h2 className="mt-2 text-xl font-semibold">
          {client.occupation || "Not set"}
        </h2>
      </Card>
    </div>
  );
}