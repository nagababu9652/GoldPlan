import { Table } from "@tanstack/react-table";

export function getVisibleColumns<TData>(
  table: Table<TData>
) {
  return table
    .getVisibleLeafColumns()
    .map((column) => column.id);
}

export function toggleAllColumns<TData>(
  table: Table<TData>,
  visible: boolean
) {
  table
    .getAllLeafColumns()
    .forEach((column) => {
      if (column.getCanHide()) {
        column.toggleVisibility(visible);
      }
    });
}