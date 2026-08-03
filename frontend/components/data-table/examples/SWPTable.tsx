"use client";

import { DataTable } from "@/components/data-table";

import { swpColumns } from "./swp.columns";
import { swpFilters } from "./swp.filters";
import { SWP } from "./swp.types";

interface Props {
  swps: SWP[];
}

export default function SWPTable({ swps }: Props) {
  return (
    <DataTable
      columns={swpColumns}
      data={swps}
      searchable
      filterable
      selectable
      pagination
      exportable
      filters={swpFilters}
    />
  );
}