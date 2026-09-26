"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { getClients, type Client } from "@/lib/api";

import {
  ClientToolbar,
  BulkActions,
  clientColumns,
} from ".";

export default function ClientTable() {
  const [clients, setClients] = useState<Client[]>([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [risk, setRisk] = useState("all");

  const [viewClientId, setViewClientId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRows] = useState(0);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("finplan_token");

      if (!token) {
        setError("Please login to access clients.");
        return;
      }

      const response = await getClients(token, {
        page_size: 100,
        page: 1,
      });

      setClients(response.clients ?? []);
    } catch (err) {
      console.error("Client loading error:", err);

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

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const searchText = search.toLowerCase().trim();

      const clientName =
        `${client.first_name} ${client.last_name}`.trim();

      const matchesSearch =
        !searchText ||
        clientName.toLowerCase().includes(searchText) ||
        client.email?.toLowerCase().includes(searchText) ||
        client.phone?.includes(searchText) ||
        client.pan_number?.toLowerCase().includes(searchText);

      const matchesStatus =
        status === "all" ||
        (status === "ACTIVE" && client.is_active) ||
        (status === "INACTIVE" && !client.is_active);

      const matchesRisk =
        risk === "all" ||
        client.risk_profile === risk;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRisk
      );
    });
  }, [
    clients,
    search,
    status,
    risk,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-ash">
          Loading clients...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-line bg-bone p-6">
        <p className="text-sm text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClientToolbar
        search={search}
        status={status}
        risk={risk}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onRiskChange={setRisk}
        onAddClient={() => {}}
        onExport={() => {}}
      />

      <BulkActions selected={selectedRows} />

      <DataTable
        columns={clientColumns((clientId) => {
          setViewClientId(clientId);
        })}
        data={filteredClients}
      />

      {viewClientId && (
        <div className="text-xs text-muted-foreground">
          Selected client: {viewClientId}
        </div>
      )}
    </div>
  );
}