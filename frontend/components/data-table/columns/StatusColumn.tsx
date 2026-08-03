"use client";

import { Badge } from "@/components/ui/badge";

interface Props {
  value: string;
}

const COLORS = {
  Active: "success",
  Pending: "warning",
  Inactive: "secondary",
  Rejected: "destructive",
};

export default function StatusColumn({
  value,
}: Props) {
  return (
    <Badge
      variant={
        COLORS[
          value as keyof typeof COLORS
        ] ?? "secondary"
      }
    >
      {value}
    </Badge>
  );
}