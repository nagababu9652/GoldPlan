"use client";

import SkeletonRow from "./SkeletonRow";

interface Props {
  columns: number;
  rows?: number;
}

export default function SkeletonTable({
  columns,
  rows = 8,
}: Props) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonRow
          key={index}
          columns={columns}
        />
      ))}
    </>
  );
}