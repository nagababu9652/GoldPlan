"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TableProps
  extends React.TableHTMLAttributes<HTMLTableElement> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full overflow-auto rounded-xl border border-line bg-white">
        <table
          ref={ref}
          className={cn(
            "w-full caption-bottom border-collapse text-sm",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Table.displayName = "Table";

export default Table;