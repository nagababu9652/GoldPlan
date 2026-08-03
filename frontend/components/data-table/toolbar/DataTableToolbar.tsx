"use client";

import { Table } from "@tanstack/react-table";
import { ReactNode } from "react";

import DataTableSearch from "./DataTableSearch";
import DataTableFilters from "./DataTableFilters";
import DataTableExport from "./DataTableExport";
import DataTableRefresh from "./DataTableRefresh";
import DataTableColumnToggle from "./DataTableColumnToggle";
import DataTableDensity from "./DataTableDensity";

import {
  DataTableBulkAction,
  DataTableFilter,
  DataTableToolbarAction,
} from "../types";

interface Props<TData> {
  table: Table<TData>;

  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  columnVisibility?: boolean;
  density?: boolean;
  refreshable?: boolean;

  filters?: DataTableFilter[];
  toolbarActions?: DataTableToolbarAction[];
  bulkActions?: DataTableBulkAction[];

  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

export default function DataTableToolbar<TData>({
  table,

  searchable = true,
  filterable = true,
  exportable = true,
  columnVisibility = true,
  density = true,
  refreshable = true,

  filters,

  toolbarActions,

  leftSlot,
  rightSlot,
}: Props<TData>) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 lg:flex-row lg:items-center lg:justify-between">

      <div className="flex flex-wrap items-center gap-2">

        {searchable && (
          <DataTableSearch table={table} />
        )}

        {filterable && filters && (
          <DataTableFilters
            table={table}
            filters={filters}
          />
        )}

        {leftSlot}

      </div>

      <div className="flex flex-wrap items-center gap-2">

        {toolbarActions?.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            {action.icon}
            <span className="ml-2">{action.label}</span>
          </button>
        ))}

        {density && (
          <DataTableDensity />
        )}

        {columnVisibility && (
          <DataTableColumnToggle table={table} />
        )}

        {refreshable && (
          <DataTableRefresh />
        )}

        {exportable && (
          <DataTableExport table={table} />
        )}

        {rightSlot}

      </div>

    </div>
  );
}