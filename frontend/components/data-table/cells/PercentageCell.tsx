"use client";

import { cn } from "@/lib/utils";

interface PercentageCellProps {
  value: number;
}

export default function PercentageCell({
  value,
}: PercentageCellProps) {
  const positive = value >= 0;

  return (
    <span
      className={cn(
        "font-medium",
        positive
          ? "text-green-600"
          : "text-red-600"
      )}
    >
      {positive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}