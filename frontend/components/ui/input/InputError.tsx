"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function InputError({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "mt-1 text-xs text-red-600",
        className
      )}
      {...props}
    />
  );
}