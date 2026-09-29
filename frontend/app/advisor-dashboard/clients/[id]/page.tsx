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
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Client details
        </div>
        <p className="mt-4 text-sm text-ash">Loading client...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-red-200 bg-red-50 text-red-600">
          Client details
        </div>
        <p className="mt-4 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="dashboard-panel p-6 lg:p-8">
        <div className="dashboard-pill border-obsidian/10 bg-obsidian/[0.02]">
          Client details
        </div>

        <h1 className="mt-4 font-serif text-4xl tracking-tight text-obsidian lg:text-5xl">
          Client not found
        </h1>

        <p className="mt-2 text-sm text-ash">
          The requested client could not be found or you do not have access to this client.
        </p>

        <button
          type="button"
          onClick={() => router.push("/advisor-dashboard/clients")}
          className="mt-4 rounded-full bg-obsidian px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-bone transition-colors hover:bg-obsidian/90"
        >
          Back to Clients
        </button>
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