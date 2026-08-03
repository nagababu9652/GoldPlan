"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps
    extends React.HTMLAttributes<HTMLDivElement> {}

export default function Skeleton({
    className,
    ...props
}: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-lg bg-bone-deep",
                className
            )}
            {...props}
        />
    );
}