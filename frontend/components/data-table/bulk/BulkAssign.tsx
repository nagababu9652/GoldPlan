"use client";

import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  onClick: () => void;
}

export default function BulkAssign({
  onClick,
}: Props) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
    >
      <UserPlus className="mr-2 h-4 w-4" />

      Assign
    </Button>
  );
}