"use client";

import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

interface Props<T> {
  table: Table<T>;
}

export default function TablePagination<T>({
  table,
}: Props<T>) {
  return (
    <div className="flex items-center justify-between py-4">

      <div className="text-sm text-muted-foreground">
        {table.getFilteredRowModel().rows.length} row(s)
      </div>

      <div className="flex gap-2">

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>

      </div>

    </div>
  );
}