"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-line", className)}
    {...props}
  />
));

TableBody.displayName = "TableBody";

export default TableBody;