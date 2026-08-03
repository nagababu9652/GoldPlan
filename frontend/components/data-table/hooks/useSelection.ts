"use client";

import { Table } from "@tanstack/react-table";

export function useSelection<T>(
  table: Table<T>
) {
  return {
    selectedRows:
      table.getSelectedRowModel().rows,

    selectedCount:
      table.getSelectedRowModel().rows.length,

    clearSelection: () =>
      table.resetRowSelection(),

    toggleAll:
      table.toggleAllRowsSelected,
  };
}