"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

interface BulkExportProps {
  disabled?: boolean;

  onExport?: () => void;
}

export default function BulkExport({
  disabled,
  onExport,
}: BulkExportProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={disabled}
      onClick={onExport}
    >
      <Download className="mr-2 h-4 w-4" />

      Export

    </Button>
  );
}