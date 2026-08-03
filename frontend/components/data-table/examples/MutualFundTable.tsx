"use client";

import { DataTable } from "@/components/data-table";

import { mutualFundColumns } from "./mutual-fund.columns";
import { mutualFundFilters } from "./mutual-fund.filters";
import { MutualFund } from "./mutual-fund.types";

interface Props {
  mutualFunds: MutualFund[];
}

export default function MutualFundTable({ mutualFunds }: Props) {
  return (
    <DataTable
      columns={mutualFundColumns}
      data={mutualFunds}
      searchable
      filterable
      selectable
      pagination
      exportable
      filters={mutualFundFilters}
    />
  );
}