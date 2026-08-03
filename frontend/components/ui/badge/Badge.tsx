"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { badgeVariants } from "./badge.variants";
import { BadgeProps } from "./badge.types";

const Badge = React.forwardRef<
  HTMLDivElement,
  BadgeProps
>(
  (
    {
      className,
      variant,
      size,
      dot = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({
            variant,
            size,
          }),
          className
        )}
        {...props}
      >
        {dot && (
          <span className="mr-1.5 h-2 w-2 rounded-full bg-current opacity-80" />
        )}

        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;