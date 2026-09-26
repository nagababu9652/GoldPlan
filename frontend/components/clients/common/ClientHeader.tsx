"use client";

import type { Client } from "@/lib/api";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";

interface ClientHeaderProps {
  client: Client;
}

export default function ClientHeader({
  client,
}: ClientHeaderProps) {
  const clientName =
    `${client.first_name || ""} ${client.last_name || ""}`.trim() ||
    "Unnamed Client";

  return (
    <div className="flex flex-col gap-6 rounded-xl border bg-card p-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <Link href="/advisor-dashboard/clients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        </Link>

        <h1 className="mt-4 text-3xl font-bold">
          {clientName}
        </h1>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>
            {client.status || "Status not set"}
          </Badge>

          <Badge variant="secondary">
            {client.risk_profile || "Risk not set"}
          </Badge>
        </div>
      </div>

      <Link href={`/advisor-dashboard/clients/${client.id}/edit`}>
        <Button>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Client
        </Button>
      </Link>
    </div>
  );
}