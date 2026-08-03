"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  TableCellProps
>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "px-4 py-3 align-middle",
        className
      )}
      {...props}
    />
  )
);

TableCell.displayName = "TableCell";

export default TableCell;