"use client";

import Skeleton from "./Skeleton";

export default function SkeletonCard() {
    return (
        <div className="rounded-2xl border border-line bg-white p-6">

            <Skeleton className="mb-6 h-5 w-40" />

            <Skeleton className="mb-3 h-10 w-32" />

            <Skeleton className="h-4 w-24" />

        </div>
    );
}