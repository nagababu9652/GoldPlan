"use client";

import { DataTable } from "@/components/data-table";

import { stpColumns } from "./stp.columns";
import { stpFilters } from "./stp.filters";
import { STP } from "./stp.types";

interface Props {
  stps: STP[];
}

export default function STPTable({ stps }: Props) {
  return (
    <DataTable
      columns={stpColumns}
      data={stps}
      searchable
      filterable
      selectable
      pagination
      exportable
      filters={stpFilters}
    />
  );
}