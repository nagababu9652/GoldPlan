"use client";

import { Table } from "@tanstack/react-table";

import { DataTableFilter } from "../types";

interface Props<TData> {
  table: Table<TData>;
  filters: DataTableFilter[];
}

export default function DataTableFilters<TData>({
  filters,
}: Props<TData>) {
  return (
    <>
      {filters.map((filter) => (
        <select
          key={filter.id}
          className="rounded-lg border border-line px-3 py-2"
        >
          <option value="">
            {filter.label}
          </option>

          {filter.options?.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      ))}
    </>
  );
}