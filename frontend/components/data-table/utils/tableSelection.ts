import { Table } from "@tanstack/react-table";

export function getSelectedRows<TData>(
  table: Table<TData>
) {
  return table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);
}

export function getSelectedCount<TData>(
  table: Table<TData>
) {
  return table
    .getFilteredSelectedRowModel()
    .rows.length;
}