"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const PageTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      "text-3xl font-bold tracking-tight text-obsidian",
      className
    )}
    {...props}
  />
));

PageTitle.displayName = "PageTitle";

export default PageTitle;