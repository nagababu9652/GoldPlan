"use client";

interface CurrencyCellProps {
  value: number;
  currency?: string;
}

export default function CurrencyCell({
  value,
  currency = "INR",
}: CurrencyCellProps) {
  return (
    <span className="font-medium">
      {new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(value)}
    </span>
  );
}