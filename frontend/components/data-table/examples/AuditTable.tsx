"use client";

import { DataTable } from "@/components/data-table";

import { auditColumns } from "./audit.columns";
import { auditFilters } from "./audit.filters";
import { Audit } from "./audit.types";

interface Props {
  audits: Audit[];
}

export default function AuditTable({ audits }: Props) {
  return (
    <DataTable
      columns={auditColumns}
      data={audits}
      searchable
      filterable
      selectable
      pagination
      exportable
      filters={auditFilters}
    />
  );
}