"use client";

import SkeletonTable from "./SkeletonTable";

interface Props {
  columns: number;
  rows?: number;
}

export default function DataTableLoading({
  columns,
  rows,
}: Props) {
  return (
    <SkeletonTable
      columns={columns}
      rows={rows}
    />
  );
}