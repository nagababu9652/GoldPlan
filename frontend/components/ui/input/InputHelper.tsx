"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function InputHelper({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "mt-1 text-xs text-ash",
        className
      )}
      {...props}
    />
  );
}