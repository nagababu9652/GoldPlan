"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  TableRowProps
>(
  ({ className, selected, ...props }, ref) => (
    <tr
      ref={ref}
      data-selected={selected}
      className={cn(
        "transition-colors hover:bg-bone/60",
        selected && "bg-antique/10",
        className
      )}
      {...props}
    />
  )
);

TableRow.displayName = "TableRow";

export default TableRow;