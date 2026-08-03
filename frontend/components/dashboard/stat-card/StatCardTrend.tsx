"use client";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  type?: "up" | "down" | "neutral";
  value?: string;
}

export default function StatCardTrend({
  type = "neutral",
  value,
}: Props) {
  const Icon =
    type === "up"
      ? ArrowUpRight
      : type === "down"
      ? ArrowDownRight
      : ArrowRight;

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-sm font-medium",
        type === "up" && "text-green-600",
        type === "down" && "text-red-600",
        type === "neutral" && "text-ash"
      )}
    >
      <Icon size={16} />

      {value}
    </div>
  );
}