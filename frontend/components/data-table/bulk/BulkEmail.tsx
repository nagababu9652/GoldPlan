"use client";

import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  onClick: () => void;
}

export default function BulkEmail({
  onClick,
}: Props) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
    >
      <Mail className="mr-2 h-4 w-4" />

      Email
    </Button>
  );
}