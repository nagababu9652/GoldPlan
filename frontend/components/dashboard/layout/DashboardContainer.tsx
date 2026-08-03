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
        "mx-auto w-full max-w-[1600px]",
        "px-4 py-6",
        "sm:px-6",
        "lg:px-8",
        "xl:px-10",
        "space-y-6",
        className
      )}
    >
      {children}
    </main>
  );
}