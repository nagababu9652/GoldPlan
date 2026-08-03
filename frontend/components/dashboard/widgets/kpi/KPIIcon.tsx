"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon?: LucideIcon;

  color?:
    | "primary"
    | "success"
    | "warning"
    | "danger";
}

const COLORS = {
  primary: "bg-primary/10 text-primary",

  success: "bg-green-100 text-green-700",

  warning: "bg-yellow-100 text-yellow-700",

  danger: "bg-red-100 text-red-700",
};

export default function KPIIcon({
  icon: Icon,
  color = "primary",
}: Props) {
  if (!Icon) return null;

  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-xl",
        COLORS[color]
      )}
    >
      <Icon size={24} />
    </div>
  );
}