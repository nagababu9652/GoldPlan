"use client";

import { DataTable } from "@/components/data-table";

import { reportColumns } from "./report.columns";
import { reportFilters } from "./report.filters";
import { Report } from "./report.types";

interface Props {
  reports: Report[];
}

export default function ReportTable({ reports }: Props) {
  return (
    <DataTable
      columns={reportColumns}
      data={reports}
      searchable
      filterable
      selectable
      pagination
      exportable
      filters={reportFilters}
    />
  );
}