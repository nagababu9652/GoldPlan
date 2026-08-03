"use client";

import { Table } from "@tanstack/react-table";

import { Trash2, Download, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { BulkAction } from "./bulk-actions.types";

interface Props<TData> {
  table: Table<TData>;

  actions?: BulkAction<TData>[];
}

export default function DataTableBulkActions<TData>({
  table,

  actions = [],
}: Props<TData>) {
  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  if (!selectedRows.length) return null;

  return (
    <div className="flex flex-wrap items-center justify-between rounded-xl border border-antique/20 bg-antique/5 px-4 py-3">

      <div className="font-medium text-sm">
        {selectedRows.length} selected
      </div>

      <div className="flex flex-wrap gap-2">

        {actions.map((action) => (
          <Button
            key={action.id}
            variant={
              action.variant === "danger"
                ? "destructive"
                : "outline"
            }
            size="sm"
            disabled={action.disabled}
            onClick={() =>
              action.onClick(selectedRows)
            }
          >
            {action.icon}

            {action.label}
          </Button>
        ))}

      </div>

    </div>
  );
}