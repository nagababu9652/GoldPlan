"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  onClick: () => void;
}

export default function BulkDelete({
  onClick,
}: Props) {
  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={onClick}
    >
      <Trash2 className="mr-2 h-4 w-4" />

      Delete
    </Button>
  );
}