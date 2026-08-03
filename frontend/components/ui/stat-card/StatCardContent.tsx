"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const StatCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-6 pb-5",
      className
    )}
    {...props}
  />
));

StatCardContent.displayName = "StatCardContent";

export default StatCardContent;