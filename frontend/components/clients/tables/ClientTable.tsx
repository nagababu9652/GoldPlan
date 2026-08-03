"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";

import ClientToolbar from "./ClientToolbar";
import BulkActions from "./BulkActions";

import { clientColumns } from "./ClientColumns";
import { clients } from "./mockData";

export default function ClientTable() {
  const [search, setSearch] = useState("");

  const [advisor, setAdvisor] = useState("all");

  const [status, setStatus] = useState("all");

  const [risk, setRisk] = useState("all");

  /**
   * Later this will come directly
   * from TanStack Table row selection.
   */
  const [selectedRows] = useState(0);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        client.name.toLowerCase().includes(searchText) ||
        client.email.toLowerCase().includes(searchText) ||
        client.phone.includes(searchText);

      const matchesAdvisor =
        advisor === "all" ||
        client.advisor === advisor;

      const matchesStatus =
        status === "all" ||
        client.status === status;

      const matchesRisk =
        risk === "all" ||
        client.risk === risk;

      return (
        matchesSearch &&
        matchesAdvisor &&
        matchesStatus &&
        matchesRisk
      );
    });
  }, [
    search,
    advisor,
    status,
    risk,
  ]);

  return (
    <div className="space-y-6">

      <ClientToolbar
        search={search}
        advisor={advisor}
        status={status}
        risk={risk}
        onSearchChange={setSearch}
        onAdvisorChange={setAdvisor}
        onStatusChange={setStatus}
        onRiskChange={setRisk}
        onAddClient={() => {}}
        onExport={() => {}}
      />

      <BulkActions
        selected={selectedRows}
      />

      <DataTable
        columns={clientColumns}
        data={filteredClients}
      />

    </div>
  );
}