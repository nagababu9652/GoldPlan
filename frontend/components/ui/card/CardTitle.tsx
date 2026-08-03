"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-semibold tracking-tight text-obsidian",
        className
      )}
      {...props}
    />
  );
});

CardTitle.displayName = "CardTitle";

export default CardTitle;