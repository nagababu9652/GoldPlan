"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
}

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  TableHeadProps
>(
  ({ className, sortable = false, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 whitespace-nowrap px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-ash",
        sortable && "cursor-pointer select-none hover:text-obsidian",
        className
      )}
      {...props}
    />
  )
);

TableHead.displayName = "TableHead";

export default TableHead;