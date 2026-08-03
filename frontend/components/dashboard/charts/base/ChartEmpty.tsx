"use client";

import { BarChart3 } from "lucide-react";

export default function ChartEmpty() {
  return (
    <div className="flex h-80 flex-col items-center justify-center">

      <BarChart3 className="mb-4 h-10 w-10 text-muted-foreground" />

      <p className="text-muted-foreground">
        No chart data available
      </p>

    </div>
  );
}