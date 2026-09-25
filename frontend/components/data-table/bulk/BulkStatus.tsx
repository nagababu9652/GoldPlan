"use client";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  onClick: () => void;
}

export default function BulkStatus({
  onClick,
}: Props) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
    >
      <CheckCircle2 className="mr-2 h-4 w-4" />

      Change Status
    </Button>
  );
}