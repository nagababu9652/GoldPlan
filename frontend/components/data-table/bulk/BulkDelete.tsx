"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface BulkDeleteProps {
  disabled?: boolean;

  onDelete?: () => void;
}

export default function BulkDelete({
  disabled,
  onDelete,
}: BulkDeleteProps) {
  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={disabled}
      onClick={onDelete}
    >
      <Trash2 className="mr-2 h-4 w-4" />

      Delete

    </Button>
  );
}