import {
  ColumnDef,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

export interface EnterpriseTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];

  data: TData[];

  loading?: boolean;

  searchable?: boolean;

  selectable?: boolean;

  pagination?: boolean;

  pageSize?: number;

  searchPlaceholder?: string;

  emptyMessage?: string;
}

export interface TableState {
  sorting: SortingState;

  rowSelection: RowSelectionState;

  columnVisibility: VisibilityState;

  globalFilter: string;
}