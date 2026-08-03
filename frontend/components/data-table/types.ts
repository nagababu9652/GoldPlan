import {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { ReactNode } from "react";

export type DataTableMode = "client" | "server";

export interface SelectOption {
  label: string;
  value: string;
}

export interface DataTableFilter {
  id: string;
  label: string;
  type:
    | "text"
    | "select"
    | "multi-select"
    | "date"
    | "date-range"
    | "number"
    | "custom";

  options?: SelectOption[];

  placeholder?: string;
}

export interface DataTableBulkAction {
  id: string;

  label: string;

  icon?: ReactNode;

  variant?: "default" | "danger";

  onClick: (rows: unknown[]) => void;
}

export interface DataTableToolbarAction {
  id: string;

  label: string;

  icon?: ReactNode;

  onClick: () => void;
}

export interface DataTableState {
  sorting: SortingState;

  pagination: PaginationState;

  rowSelection: RowSelectionState;

  columnVisibility: VisibilityState;

  globalFilter: string;
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];

  data: TData[];

  mode?: DataTableMode;

  loading?: boolean;

  searchable?: boolean;

  filterable?: boolean;

  selectable?: boolean;

  exportable?: boolean;

  pagination?: boolean;

  columnVisibility?: boolean;

  density?: boolean;

  refreshable?: boolean;

  emptyMessage?: string;

  filters?: DataTableFilter[];

  bulkActions?: DataTableBulkAction[];

  toolbarActions?: DataTableToolbarAction[];

  totalRows?: number;

  pageCount?: number;

  pageSize?: number;

  pageIndex?: number;

  onRefresh?: () => void;

  onSearch?: (value: string) => void;

  onRowClick?: (row: TData) => void;
}