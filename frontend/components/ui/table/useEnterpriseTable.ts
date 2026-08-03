import { useState } from "react";

import {
  SortingState,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";

export function useEnterpriseTable() {
  const [sorting, setSorting] =
    useState<SortingState>([]);

  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({});

  const [rowSelection, setRowSelection] =
    useState<RowSelectionState>({});

  const [globalFilter, setGlobalFilter] =
    useState("");

  return {
    sorting,
    setSorting,

    columnVisibility,
    setColumnVisibility,

    rowSelection,
    setRowSelection,

    globalFilter,
    setGlobalFilter,
  };
}