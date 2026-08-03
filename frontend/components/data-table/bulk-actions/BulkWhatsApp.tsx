"use client";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  onClick: () => void;
}

export default function BulkWhatsApp({
  onClick,
}: Props) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
    >
      <MessageCircle className="mr-2 h-4 w-4" />

      WhatsApp
    </Button>
  );
}