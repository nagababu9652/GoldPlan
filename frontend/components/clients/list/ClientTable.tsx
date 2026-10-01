"use client";

import { useCallback, useEffect, useState } from "react";

import EnterpriseTable from "@/components/ui/table/EnterpriseTable";

import { getClients, type Client } from "@/lib/api";

import { clientColumns } from "./columns";
import ClientToolbar from "./ClientToolbar";

export default function ClientTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [status,setStatus]=useState("all");
  const [risk,setRisk]=useState("all");
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

      const response = await getClients(token,{page_size:100,search:search.trim()||undefined,customer_status:status==='all'?undefined:status,risk_profile:risk==='all'?undefined:risk});

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
  }, [search,status,risk]);

  useEffect(() => {
    const timer=setTimeout(()=>void loadClients(),300);return()=>clearTimeout(timer);
  }, [loadClients]);

  return (
    <>
      <ClientToolbar
        search={search}
        onSearchChange={setSearch}
        onRefresh={loadClients}
        status={status}
        risk={risk}
        onStatusChange={setStatus}
        onRiskChange={setRisk}
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
      ) : clients.length === 0 ? (
        <div className="rounded-xl border border-line bg-bone p-8 text-center">
          <p className="text-sm text-ash">
            {search||status!=="all"||risk!=="all"
              ? "No clients match the selected filters."
              : "No clients found."}
          </p>
        </div>
      ) : (
        <EnterpriseTable
          columns={clientColumns}
          data={clients}
        />
      )}
    </>
  );
}
