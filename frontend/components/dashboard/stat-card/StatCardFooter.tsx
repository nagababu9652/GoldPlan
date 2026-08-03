"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const StatCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "border-t border-line px-6 py-4",
      className
    )}
    {...props}
  />
));

StatCardFooter.displayName = "StatCardFooter";

export default StatCardFooter;