"use client";

import * as React from "react";

import {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";

import { DataTableMode } from "../types";

interface UseDataTableProps<TData> {
  data: TData[];

  columns: ColumnDef<TData, unknown>[];

  mode?: DataTableMode;

  pageCount?: number;
}

export function useDataTable<TData>({
  data,
  columns,
  mode = "client",
  pageCount,
}: UseDataTableProps<TData>) {
  const [sorting, setSorting] =
    React.useState<SortingState>([]);

  const [pagination, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  const [rowSelection, setRowSelection] =
    React.useState<RowSelectionState>({});

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);

  const [globalFilter, setGlobalFilter] =
    React.useState("");

  const table = useReactTable({
    data,

    columns,

    pageCount,

    manualPagination: mode === "server",

    manualSorting: mode === "server",

    manualFiltering: mode === "server",

    state: {
      sorting,
      pagination,
      rowSelection,
      columnVisibility,
      columnFilters,
      globalFilter,
    },

    enableRowSelection: true,

    onSortingChange: setSorting,

    onPaginationChange: setPagination,

    onRowSelectionChange: setRowSelection,

    onColumnVisibilityChange:
      setColumnVisibility,

    onColumnFiltersChange:
      setColumnFilters,

    onGlobalFilterChange:
      setGlobalFilter,

    getCoreRowModel:
      getCoreRowModel(),

    getSortedRowModel:
      mode === "client"
        ? getSortedRowModel()
        : undefined,

    getFilteredRowModel:
      mode === "client"
        ? getFilteredRowModel()
        : undefined,

    getPaginationRowModel:
      mode === "client"
        ? getPaginationRowModel()
        : undefined,
  });

  return {
    table,

    sorting,

    pagination,

    rowSelection,

    columnVisibility,

    columnFilters,

    globalFilter,

    setSorting,

    setPagination,

    setRowSelection,

    setColumnVisibility,

    setColumnFilters,

    setGlobalFilter,

    flexRender,
  };
}