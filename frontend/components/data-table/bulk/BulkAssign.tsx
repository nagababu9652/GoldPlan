"use client";

import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface BulkAssignProps {
  disabled?: boolean;

  label?: string;

  onAssign?: () => void;
}

export default function BulkAssign({
  disabled,
  label = "Assign",
  onAssign,
}: BulkAssignProps) {
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={disabled}
      onClick={onAssign}
    >
      <UserPlus className="mr-2 h-4 w-4" />

      {label}

    </Button>
  );
}