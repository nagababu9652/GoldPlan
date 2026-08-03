"use client";

import { Database } from "lucide-react";

interface Props {
  title?: string;
  description?: string;
}

export default function DataTableEmpty({
  title = "No records found",
  description = "There are no records available.",
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Database className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="text-lg font-semibold">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}