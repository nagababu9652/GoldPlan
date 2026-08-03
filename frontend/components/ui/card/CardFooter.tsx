"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-end gap-3 border-t border-line p-6",
        className
      )}
      {...props}
    />
  );
});

CardFooter.displayName = "CardFooter";

export default CardFooter;