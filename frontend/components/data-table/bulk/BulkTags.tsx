"use client";

import { Tags } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  onClick: () => void;
}

export default function BulkTags({
  onClick,
}: Props) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
    >
      <Tags className="mr-2 h-4 w-4" />

      Add Tags
    </Button>
  );
}