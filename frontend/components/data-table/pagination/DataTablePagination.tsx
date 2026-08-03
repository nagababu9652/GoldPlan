"use client";

import { Table } from "@tanstack/react-table";

import PageInfo from "./PageInfo";
import PageSize from "./PageSize";
import PaginationButtons from "./PaginationButtons";
import GoToPage from "./GoToPage";

interface Props<TData> {
  table: Table<TData>;
}

export default function DataTablePagination<TData>({
  table,
}: Props<TData>) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between">

      <PageInfo table={table} />

      <div className="flex flex-wrap items-center gap-4">

        <PageSize table={table} />

        <GoToPage table={table} />

        <PaginationButtons table={table} />

      </div>

    </div>
  );
}