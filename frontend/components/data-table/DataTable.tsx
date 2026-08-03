"use client";

import * as React from "react";
import {
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";

import { useDataTable } from "./hooks/useDataTable";
import { DataTableProps } from "./types";

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  EmptyRow,
} from "./core";

import DataTableToolbar from "./toolbar/DataTableToolbar";
import DataTablePagination from "./pagination/DataTablePagination";
import DataTableLoading from "./loading/DataTableLoading";

export default function DataTable<TData>({
  data,
  columns,
  mode = "client",

  loading = false,

  searchable = true,
  filterable = true,
  pagination = true,
  selectable = true,
  exportable = true,
  columnVisibility = true,

  filters,

  toolbarActions,

  bulkActions,

  emptyMessage,

  pageCount,
}: DataTableProps<TData>) {
  const { table } = useDataTable({
    data,
    columns,
    mode,
    pageCount,
  });

  return (
    <div className="space-y-4">

      <DataTableToolbar
        table={table}
        searchable={searchable}
        filterable={filterable}
        exportable={exportable}
        columnVisibility={columnVisibility}
        filters={filters}
        toolbarActions={toolbarActions}
        bulkActions={bulkActions}
      />

      <Table>

        <TableHeader>

          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>

              {group.headers.map((header) => (
                <TableHead key={header.id}>

                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                </TableHead>
              ))}

            </TableRow>
          ))}

        </TableHeader>

        <TableBody>

          {loading ? (
            <DataTableLoading
              columns={columns.length}
            />
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                selected={row.getIsSelected()}
              >
                {row
                  .getVisibleCells()
                  .map((cell) => (
                    <TableCell key={cell.id}>

                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}

                    </TableCell>
                  ))}
              </TableRow>
            ))
          ) : (
            <EmptyRow
              colSpan={columns.length}
              message={emptyMessage}
            />
          )}

        </TableBody>

      </Table>

      {pagination && (
        <DataTablePagination
          table={table}
        />
      )}

    </div>
  );
}