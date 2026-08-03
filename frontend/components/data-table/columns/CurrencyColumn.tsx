"use client";

import { formatCurrency } from "./helpers";

interface Props {
  value?: number;
  currency?: string;
}

export default function CurrencyColumn({
  value = 0,
  currency = "INR",
}: Props) {
  return (
    <span className="font-medium">
      {formatCurrency(value, currency)}
    </span>
  );
}