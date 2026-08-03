"use client";

import { Table } from "@tanstack/react-table";

interface Props<TData> {
  table: Table<TData>;
}

export default function GoToPage<TData>({
  table,
}: Props<TData>) {
  return (
    <div className="flex items-center gap-2">

      <span className="text-sm text-ash">
        Go to
      </span>

      <input
        type="number"
        min={1}
        max={table.getPageCount()}
        defaultValue={
          table.getState().pagination.pageIndex + 1
        }
        className="w-20 rounded-lg border border-line px-2 py-2"
        onChange={(e) => {
          const page =
            Number(e.target.value) - 1;

          table.setPageIndex(page);
        }}
      />

    </div>
  );
}