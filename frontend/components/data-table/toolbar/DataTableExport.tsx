"use client";

import { Download } from "lucide-react";
import { Table } from "@tanstack/react-table";

interface Props<TData> {
  table: Table<TData>;
}

export default function DataTableExport<TData>({
  table,
}: Props<TData>) {
  return (
    <button className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 hover:bg-bone">
      <Download size={16} />
      Export
    </button>
  );
}