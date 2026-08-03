"use client";

import {
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface Props {
  trend?: number;

  label?: string;
}

export default function KPITrend({
  trend,
  label,
}: Props) {
  if (trend === undefined) return null;

  const positive = trend >= 0;

  return (
    <div className="mt-3 flex items-center gap-2 text-sm">

      {positive ? (
        <TrendingUp
          className="text-green-600"
          size={18}
        />
      ) : (
        <TrendingDown
          className="text-red-600"
          size={18}
        />
      )}

      <span
        className={
          positive
            ? "text-green-600"
            : "text-red-600"
        }
      >
        {Math.abs(trend)}%
      </span>

      {label && (
        <span className="text-muted-foreground">
          {label}
        </span>
      )}

    </div>
  );
}