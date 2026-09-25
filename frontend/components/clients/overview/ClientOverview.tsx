"use client";

import type { Client } from "@/lib/api";

import { Card } from "@/components/ui/card";

interface Props {
  client: Client;
}

export default function ClientOverview({
  client,
}: Props) {
  return (
    <Card className="p-6">
      <h2 className="mb-6 text-xl font-semibold">
        Client Information
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">
            Customer Code
          </p>

          <p className="mt-1">
            {client.customer_code || "—"}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Status
          </p>

          <p className="mt-1">
            {client.status || "—"}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Occupation
          </p>

          <p className="mt-1">
            {client.occupation || "—"}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Resident Status
          </p>

          <p className="mt-1">
            {client.resident_status || "—"}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Risk Profile
          </p>

          <p className="mt-1">
            {client.risk_profile || "—"}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Onboarding Date
          </p>

          <p className="mt-1">
            {client.onboarding_date
              ? new Date(client.onboarding_date).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )
              : "—"}
          </p>
        </div>
      </div>
    </Card>
  );
}