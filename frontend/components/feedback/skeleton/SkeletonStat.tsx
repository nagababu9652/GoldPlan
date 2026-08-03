"use client";

import Skeleton from "./Skeleton";

export default function SkeletonStat() {
    return (
        <div className="rounded-2xl border border-line bg-white p-6">

            <Skeleton className="mb-5 h-4 w-24" />

            <Skeleton className="mb-4 h-9 w-32" />

            <Skeleton className="h-4 w-20" />

        </div>
    );
}