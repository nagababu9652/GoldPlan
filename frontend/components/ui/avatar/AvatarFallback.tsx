"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function AvatarFallback({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}