"use client";

import { Table } from "@tanstack/react-table";

const OPTIONS = [10, 20, 50, 100];

interface Props<TData> {
  table: Table<TData>;
}

export default function PageSize<TData>({
  table,
}: Props<TData>) {
  return (
    <div className="flex items-center gap-2">

      <span className="text-sm text-ash">
        Rows
      </span>

      <select
        className="rounded-lg border border-line px-2 py-2"
        value={
          table.getState().pagination.pageSize
        }
        onChange={(e) =>
          table.setPageSize(Number(e.target.value))
        }
      >
        {OPTIONS.map((size) => (
          <option
            key={size}
            value={size}
          >
            {size}
          </option>
        ))}
      </select>

    </div>
  );
}