"use client";

import { useCallback, useEffect, useState } from "react";

import EnterpriseTable from "@/components/ui/table/EnterpriseTable";

import { getClients, type Client } from "@/lib/api";

import { clientColumns } from "./columns";
import ClientToolbar from "./ClientToolbar";

export default function ClientTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("finplan_token");

      if (!token) {
        setError("Please login.");
        return;
      }

      const response = await getClients(token);

      setClients(response.clients);
    } catch (err) {
      console.error("Failed to load clients:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load clients."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const filteredClients = clients.filter((client) => {
    const value = search.trim().toLowerCase();

    if (!value) return true;

    return [
      client.first_name,
      client.last_name,
      client.email,
      client.phone,
      client.occupation,
      client.pan_number,
      client.risk_profile,
      client.kyc_status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(value);
  });

  return (
    <>
      <ClientToolbar
        search={search}
        onSearchChange={setSearch}
        onRefresh={loadClients}
      />

      {loading ? (
        <div className="rounded-xl border border-line bg-bone p-8 text-center">
          <p className="text-sm text-ash">
            Loading clients...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-bone p-8 text-center">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="rounded-xl border border-line bg-bone p-8 text-center">
          <p className="text-sm text-ash">
            {search
              ? "No clients match your search."
              : "No clients found."}
          </p>
        </div>
      ) : (
        <EnterpriseTable
          columns={clientColumns}
          data={filteredClients}
        />
      )}
    </>
  );
}