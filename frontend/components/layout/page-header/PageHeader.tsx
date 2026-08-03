"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const PageHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <header
    ref={ref}
    className={cn(
      "mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between",
      className
    )}
    {...props}
  />
));

PageHeader.displayName = "PageHeader";

export default PageHeader;