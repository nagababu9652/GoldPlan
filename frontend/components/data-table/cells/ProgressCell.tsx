"use client";

import { Progress } from "@/components/ui/progress";

interface ProgressCellProps {
  value: number;
}

export default function ProgressCell({
  value,
}: ProgressCellProps) {
  return (
    <div className="w-36 space-y-1">
      <Progress value={value} />

      <div className="text-xs text-muted-foreground">
        {value.toFixed(0)}%
      </div>
    </div>
  );
}