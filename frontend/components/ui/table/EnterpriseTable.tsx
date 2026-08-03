"use client";

import * as React from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  VisibilityState,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import TableToolbar from "./TableToolbar";
import TableSearch from "./TableSearch";
import TablePagination from "./TablePagination";

interface EnterpriseTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];

  data: TData[];

  loading?: boolean;

  searchable?: boolean;

  pagination?: boolean;

  selectable?: boolean;

  pageSize?: number;

  searchPlaceholder?: string;

  emptyMessage?: string;

  className?: string;

  filters?: React.ReactNode;

  toolbarActions?: React.ReactNode;
}

export default function EnterpriseTable<TData>({
  columns,
  data,
  loading = false,
  searchable = true,
  pagination = true,
  selectable = true,
  pageSize = 10,
  searchPlaceholder = "Search...",
  emptyMessage = "No records found.",
  className,
  filters,
  toolbarActions,
}: EnterpriseTableProps<TData>) {
  const [sorting, setSorting] =
    React.useState<SortingState>([]);

  const [globalFilter, setGlobalFilter] =
    React.useState("");

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [rowSelection, setRowSelection] =
    React.useState<RowSelectionState>({});

  const table = useReactTable({
    data,

    columns,

    state: {
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
    },

    initialState: {
      pagination: {
        pageSize,
      },
    },

    enableRowSelection: selectable,

    onSortingChange: setSorting,

    onGlobalFilterChange: setGlobalFilter,

    onColumnVisibilityChange: setColumnVisibility,

    onRowSelectionChange: setRowSelection,

    getCoreRowModel: getCoreRowModel(),

    getSortedRowModel: getSortedRowModel(),

    getFilteredRowModel: getFilteredRowModel(),

    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div
      className={cn(
        "space-y-6",
        className
      )}
    >
      {(searchable ||
        filters ||
        toolbarActions) && (
        <TableToolbar
          search={
            searchable ? (
              <TableSearch
                value={globalFilter}
                onChange={
                  setGlobalFilter
                }
                placeholder={
                  searchPlaceholder
                }
              />
            ) : null
          }
          filters={filters}
          actions={toolbarActions}
        />
      )}

      <div className="overflow-hidden rounded-xl border bg-background">

        <div className="overflow-x-auto">

          <Table>

            <TableHeader>

              {table
                .getHeaderGroups()
                .map((headerGroup) => (
                  <TableRow
                    key={
                      headerGroup.id
                    }
                  >
                    {headerGroup.headers.map(
                      (header) => (
                        <TableHead
                          key={
                            header.id
                          }
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header
                                  .column
                                  .columnDef
                                  .header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    )}
                  </TableRow>
                ))}

            </TableHeader>

            <TableBody>

              {loading ? (
                <TableRow>

                  <TableCell
                    colSpan={
                      columns.length
                    }
                    className="h-40 text-center"
                  >
                    Loading...
                  </TableCell>

                </TableRow>
              ) : table
                  .getRowModel()
                  .rows.length ? (
                table
                  .getRowModel()
                  .rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={
                        row.getIsSelected() &&
                        "selected"
                      }
                    >
                      {row
                        .getVisibleCells()
                        .map((cell) => (
                          <TableCell
                            key={
                              cell.id
                            }
                          >
                            {flexRender(
                              cell
                                .column
                                .columnDef
                                .cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
              ) : (
                <TableRow>

                  <TableCell
                    colSpan={
                      columns.length
                    }
                    className="h-40 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>

                </TableRow>
              )}

            </TableBody>

          </Table>

        </div>

      </div>

      {pagination && (
        <TablePagination
          table={table}
        />
      )}

    </div>
  );
}