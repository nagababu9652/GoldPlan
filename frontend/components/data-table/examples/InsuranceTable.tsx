"use client";

import { DataTable } from "@/components/data-table";

import { insuranceColumns } from "./insurance.columns";
import { insuranceFilters } from "./insurance.filters";
import { Insurance } from "./insurance.types";

interface Props {
  insurances: Insurance[];
}

export default function InsuranceTable({ insurances }: Props) {
  return (
    <DataTable
      columns={insuranceColumns}
      data={insurances}
      searchable
      filterable
      selectable
      pagination
      exportable
      filters={insuranceFilters}
    />
  );
}