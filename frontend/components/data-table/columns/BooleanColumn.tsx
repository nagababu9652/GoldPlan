"use client";

import { Check, X } from "lucide-react";

interface Props {
  value: boolean;
}

export default function BooleanColumn({
  value,
}: Props) {
  return value ? (
    <Check className="text-green-600" />
  ) : (
    <X className="text-red-500" />
  );
}