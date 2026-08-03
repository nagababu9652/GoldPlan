import { ReactNode } from "react";

export type RowActionVariant =
  | "default"
  | "primary"
  | "danger"
  | "success"
  | "warning";

export interface RowAction<TData = unknown> {
  id: string;

  label: string;

  icon?: ReactNode;

  variant?: RowActionVariant;

  disabled?: boolean;

  hidden?: boolean;

  divider?: boolean;

  onClick: (row: TData) => void;
}