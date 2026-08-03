"use client";

import { Table } from "@tanstack/react-table";

export function usePagination<T>(
  table: Table<T>
) {
  return {
    pageIndex:
      table.getState().pagination.pageIndex,

    pageSize:
      table.getState().pagination.pageSize,

    pageCount:
      table.getPageCount(),

    canPrevious:
      table.getCanPreviousPage(),

    canNext:
      table.getCanNextPage(),

    nextPage: () => table.nextPage(),

    previousPage: () =>
      table.previousPage(),

    setPageSize: table.setPageSize,
  };
}