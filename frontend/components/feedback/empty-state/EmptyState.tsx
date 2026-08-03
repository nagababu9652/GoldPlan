"use client";

import * as React from "react";

import { SearchX } from "lucide-react";

import { cn } from "@/lib/utils";

import { EmptyStateProps } from "./empty-state.types";

const EmptyState = React.forwardRef<
  HTMLDivElement,
  EmptyStateProps
>(
  (
    {
      className,
      icon,
      title,
      description,
      action,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-8 py-14 text-center",
        className
      )}
      {...props}
    >
      <div className="mb-5 rounded-full bg-bone-deep p-4 text-antique">
        {icon ?? <SearchX className="h-8 w-8" />}
      </div>

      <h3 className="text-xl font-semibold text-obsidian">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-md text-sm text-ash">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  )
);

EmptyState.displayName = "EmptyState";

export default EmptyState;