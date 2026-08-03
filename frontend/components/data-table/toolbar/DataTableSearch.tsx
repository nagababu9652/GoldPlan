"use client";

import { Search } from "lucide-react";
import { Table } from "@tanstack/react-table";

interface Props<TData> {
  table: Table<TData>;
}

export default function DataTableSearch<TData>({
  table,
}: Props<TData>) {
  return (
    <div className="relative w-72">

      <Search
        size={16}
        className="absolute left-3 top-3 text-ash"
      />

      <input
        placeholder="Search..."
        value={
          (table.getState().globalFilter ??
            "") as string
        }
        onChange={(e) =>
          table.setGlobalFilter(e.target.value)
        }
        className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 outline-none focus:border-antique"
      />

    </div>
  );
}