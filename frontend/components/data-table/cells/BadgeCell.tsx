"use client";

import { Badge } from "@/components/ui/badge";

interface BadgeCellProps {
  label: string;
}

export default function BadgeCell({
  label,
}: BadgeCellProps) {
  return (
    <Badge variant="secondary">
      {label}
    </Badge>
  );
}