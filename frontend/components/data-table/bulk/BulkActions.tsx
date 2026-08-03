"use client";

import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BulkActionsProps {
  selectedCount: number;

  children?: ReactNode;

  onClearSelection?: () => void;
}

export default function BulkActions({
  selectedCount,
  children,
  onClearSelection,
}: BulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">

      <div className="flex items-center gap-3">

        <Badge variant="secondary">
          {selectedCount} Selected
        </Badge>

        <span className="text-sm text-muted-foreground">
          Bulk actions available
        </span>

      </div>

      <div className="flex flex-wrap items-center gap-2">

        {children}

        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
        >
          Clear Selection
        </Button>

      </div>

    </div>
  );
}