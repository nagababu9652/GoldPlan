"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardSectionProps {
  children: ReactNode;

  className?: string;

  cols?:
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12;
}

const COLUMN_CLASSES = {
  1: "col-span-12 lg:col-span-1",
  2: "col-span-12 lg:col-span-2",
  3: "col-span-12 lg:col-span-3",
  4: "col-span-12 lg:col-span-4",
  5: "col-span-12 lg:col-span-5",
  6: "col-span-12 lg:col-span-6",
  7: "col-span-12 lg:col-span-7",
  8: "col-span-12 lg:col-span-8",
  9: "col-span-12 lg:col-span-9",
  10: "col-span-12 lg:col-span-10",
  11: "col-span-12 lg:col-span-11",
  12: "col-span-12",
};

export default function DashboardSection({
  children,
  cols = 12,
  className,
}: DashboardSectionProps) {
  return (
    <section
      className={cn(
        COLUMN_CLASSES[cols],
        className
      )}
    >
      {children}
    </section>
  );
}