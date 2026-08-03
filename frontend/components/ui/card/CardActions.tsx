"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const CardActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2",
        className
      )}
      {...props}
    />
  );
});

CardActions.displayName = "CardActions";

export default CardActions;