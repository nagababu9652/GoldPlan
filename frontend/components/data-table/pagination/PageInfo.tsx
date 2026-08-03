"use client";

import { Table } from "@tanstack/react-table";

interface Props<TData> {
  table: Table<TData>;
}

export default function PageInfo<TData>({
  table,
}: Props<TData>) {

  const total =
    table.getFilteredRowModel().rows.length;

  const start =
    total === 0
      ? 0
      : table.getState().pagination.pageIndex *
          table.getState().pagination.pageSize +
        1;

  const end = Math.min(
    start +
      table.getState().pagination.pageSize -
      1,
    total
  );

  return (
    <p className="text-sm text-ash">
      Showing{" "}
      <span className="font-semibold">
        {start}
      </span>{" "}
      to{" "}
      <span className="font-semibold">
        {end}
      </span>{" "}
      of{" "}
      <span className="font-semibold">
        {total}
      </span>{" "}
      records
    </p>
  );
}