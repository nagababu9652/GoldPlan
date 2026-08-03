"use client";

import { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function InputLabel({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-2 block text-sm font-medium text-obsidian",
        className
      )}
      {...props}
    />
  );
}