import { Table } from "@tanstack/react-table";

export function resetTable<TData>(
  table: Table<TData>
) {
  table.resetSorting();
  table.resetColumnFilters();
  table.resetGlobalFilter();
  table.resetRowSelection();
  table.resetPagination();
}

export function clearFilters<TData>(
  table: Table<TData>
) {
  table.resetColumnFilters();
  table.resetGlobalFilter();
}

export function hasSelectedRows<TData>(
  table: Table<TData>
) {
  return (
    table.getFilteredSelectedRowModel().rows.length > 0
  );
}