"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn(
        "mt-1 text-sm text-ash",
        className
      )}
      {...props}
    />
  );
});

CardDescription.displayName = "CardDescription";

export default CardDescription;