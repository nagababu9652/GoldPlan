"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WidgetHeaderProps {
  title: string;

  description?: string;

  actions?: ReactNode;

  className?: string;
}

export default function WidgetHeader({
  title,
  description,
  actions,
  className,
}: WidgetHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between",
        "border-b border-border",
        "px-6 py-4",
        className
      )}
    >
      <div className="min-w-0">

        <h3 className="text-base font-semibold">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        )}

      </div>

      {actions}
    </div>
  );
}