import { ReactElement, ReactNode } from "react";

export type RowActionVariant =
  | "default"
  | "primary"
  | "danger"
  | "destructive"
  | "success"
  | "warning";

export interface RowAction<TData = unknown> {
  id: string;

  label: string;

  icon?: ReactElement | ReactNode;

  variant?: RowActionVariant;

  disabled?: boolean;

  hidden?: boolean;

  divider?: boolean;

  onClick: (row: TData) => void;
}
