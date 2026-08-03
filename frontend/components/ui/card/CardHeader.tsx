"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-start justify-between border-b border-line p-6",
        className
      )}
      {...props}
    />
  );
});

CardHeader.displayName = "CardHeader";

export default CardHeader;