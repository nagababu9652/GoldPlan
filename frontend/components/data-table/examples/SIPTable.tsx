"use client";

import { DataTable } from "@/components/data-table";

import { sipColumns } from "./sip.columns";
import { sipFilters } from "./sip.filters";
import { SIP } from "./sip.types";

interface Props {
  sips: SIP[];
}

export default function SIPTable({ sips }: Props) {
  return (
    <DataTable
      columns={sipColumns}
      data={sips}
      searchable
      filterable
      selectable
      pagination
      exportable
      filters={sipFilters}
    />
  );
}