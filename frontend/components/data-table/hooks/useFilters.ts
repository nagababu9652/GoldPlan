"use client";

import { Table } from "@tanstack/react-table";

export function useFilters<T>(
  table: Table<T>
) {
  return {
    globalFilter:
      table.getState().globalFilter,

    setGlobalFilter:
      table.setGlobalFilter,

    columnFilters:
      table.getState().columnFilters,

    resetFilters: () =>
      table.resetColumnFilters(),
  };
}