"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "sticky top-0 z-10 border-b border-line bg-bone",
      className
    )}
    {...props}
  />
));

TableHeader.displayName = "TableHeader";

export default TableHeader;