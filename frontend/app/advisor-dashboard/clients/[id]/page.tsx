"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ClientHeader from "@/components/clients/common/ClientHeader";
import ClientSummaryCards from "@/components/clients/common/ClientSummaryCards";
import ClientOverview from "@/components/clients/overview/ClientOverview";

import { getClientById } from "@/lib/api";
import type { Client } from "@/lib/api";

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClient() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("finplan_token");

        if (!token) {
          setError("Please login.");
          return;
        }

        const data = await getClientById(token, id);

        setClient(data);
      } catch (err) {
        console.error("Failed to load client:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load client."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadClient();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Loading client...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-card p-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-6">
          <h1 className="text-xl font-semibold">
            Client not found
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            The requested client could not be found or you do not
            have access to this client.
          </p>

          <button
            type="button"
            onClick={() => router.push("/advisor-dashboard/clients")}
            className="mt-4 text-sm font-medium underline"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClientHeader client={client} />

      <ClientSummaryCards client={client} />

      <ClientOverview client={client} />
    </div>
  );
}