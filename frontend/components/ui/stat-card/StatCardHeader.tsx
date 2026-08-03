"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const StatCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-start justify-between p-6 pb-3",
      className
    )}
    {...props}
  />
));

StatCardHeader.displayName = "StatCardHeader";

export default StatCardHeader;