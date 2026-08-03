"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  onClick: () => void;
}

export default function BulkExport({
  onClick,
}: Props) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
    >
      <Download className="mr-2 h-4 w-4" />

      Export
    </Button>
  );
}