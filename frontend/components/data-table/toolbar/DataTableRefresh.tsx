"use client";

import { RefreshCw } from "lucide-react";

export default function DataTableRefresh() {
  return (
    <button className="rounded-lg border border-line p-2 hover:bg-bone">
      <RefreshCw size={18} />
    </button>
  );
}