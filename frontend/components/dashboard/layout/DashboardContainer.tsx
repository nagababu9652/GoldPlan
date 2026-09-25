"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardContainerProps {
  children: ReactNode;
  className?: string;
}

export default function DashboardContainer({
  children,
  className,
}: DashboardContainerProps) {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-[1480px]",
        "px-4 py-7",
        "sm:px-6 sm:py-8",
        "lg:px-8",
        "xl:px-10",
        "space-y-8",
        className
      )}
    >
      {children}
    </main>
  );
}