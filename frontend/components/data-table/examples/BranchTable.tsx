"use client";

import { DataTable } from "@/components/data-table";

import { branchColumns } from "./branch.columns";
import { branchFilters } from "./branch.filters";
import { Branch } from "./branch.types";

interface Props {
  branches: Branch[];
}

export default function BranchTable({ branches }: Props) {
  return (
    <DataTable
      columns={branchColumns}
      data={branches}
      searchable
      filterable
      selectable
      pagination
      exportable
      filters={branchFilters}
    />
  );
}