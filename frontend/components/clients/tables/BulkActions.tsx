"use client";

import { Button } from "@/components/ui/button";

interface BulkActionsProps {
  selected: number;
}

export default function BulkActions({
  selected,
}: BulkActionsProps) {
  if (selected === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-4">

      <span className="font-medium">
        {selected} client(s) selected
      </span>

      <div className="flex gap-2">

        <Button variant="outline">
          Assign RM
        </Button>

        <Button variant="outline">
          Export
        </Button>

        <Button variant="destructive">
          Archive
        </Button>

      </div>

    </div>
  );
}