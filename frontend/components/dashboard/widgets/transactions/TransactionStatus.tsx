"use client";

import { Badge } from "@/components/ui/badge";
import { TransactionStatus as Status } from "./types";

interface Props {
  status: Status;
}

const STATUS_VARIANTS = {
  SUCCESS: "success",
  PENDING: "warning",
  FAILED: "danger",
  CANCELLED: "outline",
} as const;

export default function TransactionStatus({
  status,
}: Props) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {status}
    </Badge>
  );
}