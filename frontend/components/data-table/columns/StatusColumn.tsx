"use client";

import { Badge } from "@/components/ui/badge";

interface Props {
  value: string;
}

const COLORS = {
  Active: "success",
  Pending: "warning",
  Inactive: "secondary",
  Rejected: "danger",
} as const;

export default function StatusColumn({
  value,
}: Props) {
  const badgeVariant =
    (COLORS[value as keyof typeof COLORS] ?? "secondary") as
      | "default"
      | "secondary"
      | "outline"
      | "success"
      | "warning"
      | "danger"
      | "info"
      | "purple";

  return (
    <Badge variant={badgeVariant}>
      {value}
    </Badge>
  );
}