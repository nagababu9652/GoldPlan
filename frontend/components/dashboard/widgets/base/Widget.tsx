"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface WidgetProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;

  loading?: boolean;

  hover?: boolean;

  clickable?: boolean;

  bordered?: boolean;

  padding?: "none" | "sm" | "md" | "lg";
}

const PADDING = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Widget({
  children,
  className,

  loading = false,
  hover = true,
  clickable = false,
  bordered = true,
  padding = "md",

  ...props
}: WidgetProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-background transition-all duration-200",

        bordered && "border border-border",

        hover &&
          "hover:-translate-y-0.5 hover:shadow-lg",

        clickable &&
          "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40",

        loading && "pointer-events-none opacity-70",

        PADDING[padding],

        className
      )}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
}