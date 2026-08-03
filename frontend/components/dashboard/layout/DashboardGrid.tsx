"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
}

export default function DashboardGrid({
  children,
  className,
}: DashboardGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-12 gap-6",
        className
      )}
    >
      {children}
    </div>
  );
}