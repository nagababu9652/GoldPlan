"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusCellProps {
  status: string;
}

const colors: Record<string, string> = {
  ACTIVE:
    "bg-green-100 text-green-700 border-green-200",

  INACTIVE:
    "bg-gray-100 text-gray-700 border-gray-200",

  PENDING:
    "bg-yellow-100 text-yellow-700 border-yellow-200",

  BLOCKED:
    "bg-red-100 text-red-700 border-red-200",

  SUCCESS:
    "bg-green-100 text-green-700",

  FAILED:
    "bg-red-100 text-red-700",
};

export default function StatusCell({
  status,
}: StatusCellProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        colors[status] ??
          "bg-secondary text-secondary-foreground"
      )}
    >
      {status}
    </Badge>
  );
}