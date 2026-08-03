"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("p-6", className)}
      {...props}
    />
  );
});

CardContent.displayName = "CardContent";

export default CardContent;