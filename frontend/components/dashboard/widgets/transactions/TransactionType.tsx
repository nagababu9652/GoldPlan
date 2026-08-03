"use client";

import { Badge } from "@/components/ui/badge";
import { TransactionType as Type } from "./types";

interface Props {
  type: Type;
}

export default function TransactionType({
  type,
}: Props) {
  return (
    <Badge variant="outline">
      {type}
    </Badge>
  );
}