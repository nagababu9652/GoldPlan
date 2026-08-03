"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-line bg-white shadow-sm transition-shadow",
        "hover:shadow-md",
        className
      )}
      {...props}
    />
  );
});

Card.displayName = "Card";

export default Card;
