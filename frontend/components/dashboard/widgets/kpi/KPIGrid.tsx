"use client";

import { ReactNode } from "react";

interface KPIGridProps {
  children: ReactNode;
}

export default function KPIGrid({
  children,
}: KPIGridProps) {
  return (
    <div
      className="
        grid
        gap-6

        grid-cols-1

        sm:grid-cols-2

        xl:grid-cols-4
      "
    >
      {children}
    </div>
  );
}