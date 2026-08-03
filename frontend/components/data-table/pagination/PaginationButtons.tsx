"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Table } from "@tanstack/react-table";

interface Props<TData> {
  table: Table<TData>;
}

export default function PaginationButtons<TData>({
  table,
}: Props<TData>) {
  return (
    <div className="flex items-center gap-1">

      <button
        onClick={() => table.setPageIndex(0)}
        disabled={!table.getCanPreviousPage()}
      >
        <ChevronsLeft size={18} />
      </button>

      <button
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <ChevronLeft size={18} />
      </button>

      <span className="px-4 text-sm">
        {table.getState().pagination.pageIndex + 1}
        {" / "}
        {table.getPageCount()}
      </span>

      <button
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        <ChevronRight size={18} />
      </button>

      <button
        onClick={() =>
          table.setPageIndex(
            table.getPageCount() - 1
          )
        }
        disabled={!table.getCanNextPage()}
      >
        <ChevronsRight size={18} />
      </button>

    </div>
  );
}