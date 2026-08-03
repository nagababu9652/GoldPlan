"use client";

import { cn } from "@/lib/utils";

interface Props {
  label: string;

  icon?: React.ReactNode;

  variant?: "default" | "danger";

  disabled?: boolean;

  onClick?: () => void;
}

export default function ActionItem({
  label,
  icon,
  variant = "default",
  disabled,
  onClick,
}: Props) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",

        variant === "default" &&
          "hover:bg-bone",

        variant === "danger" &&
          "text-red-600 hover:bg-red-50",

        disabled &&
          "cursor-not-allowed opacity-50"
      )}
    >
      {icon}

      <span>{label}</span>
    </button>
  );
}