"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "animate-pulse rounded-md bg-bone-deep",
        className
      )}
      {...props}
    />
  )
);

Skeleton.displayName = "Skeleton";

export default Skeleton;