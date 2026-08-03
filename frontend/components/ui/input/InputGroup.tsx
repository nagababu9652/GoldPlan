"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function InputGroup({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "space-y-1.5",
        className
      )}
      {...props}
    />
  );
}