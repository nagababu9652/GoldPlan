import { ReactNode } from "react";

export interface BulkAction<TData = unknown> {
  id: string;

  label: string;

  icon?: ReactNode;

  variant?: "default" | "danger" | "primary";

  disabled?: boolean;

  hidden?: boolean;

  onClick: (rows: TData[]) => void;
}