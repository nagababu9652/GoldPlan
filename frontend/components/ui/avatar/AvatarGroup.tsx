"use client";

import { AvatarGroupProps } from "./avatar.types";
import { cn } from "@/lib/utils";

export default function AvatarGroup({
  className,
  children,
}: AvatarGroupProps) {
  return (
    <div
      className={cn(
        "flex -space-x-3",
        className
      )}
    >
      {children}
    </div>
  );
}