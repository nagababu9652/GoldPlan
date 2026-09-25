"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({
  rows = 8,
  columns = 6,
}: TableSkeletonProps) {
  return (
    <div className="rounded-lg border">
      <div className="border-b p-4">
        <Skeleton className="h-8 w-64" />
      </div>

      <div className="divide-y">
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="grid gap-4 p-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`,
            }}
          >
            {Array.from({ length: columns }).map((_, column) => (
              <Skeleton
                key={column}
                className="h-5 w-full"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}