"use client";

import { Table } from "@tanstack/react-table";

export function useColumnVisibility<T>(
  table: Table<T>
) {
  return {
    columns:
      table.getAllLeafColumns(),

    toggle:
      table.toggleAllColumnsVisible,

    reset: () =>
      table.resetColumnVisibility(),
  };
}