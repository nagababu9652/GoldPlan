"use client";

import { Database } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = "No data available",
  description = "There are no records to display.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Database className="mb-4 h-10 w-10 text-muted-foreground" />

      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}