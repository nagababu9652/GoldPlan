"use client";

import { Columns3 } from "lucide-react";
import { Table } from "@tanstack/react-table";

interface Props<TData> {
  table: Table<TData>;
}

export default function DataTableColumnToggle<TData>({
  table,
}: Props<TData>) {
  return (
    <div className="relative">

      <button className="rounded-lg border border-line p-2 hover:bg-bone">
        <Columns3 size={18} />
      </button>

      {/* Dropdown Menu (implement using your Dropdown component) */}

    </div>
  );
}