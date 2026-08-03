"use client";

export interface SkeletonRowProps {
  columns: number;
}

export default function SkeletonRow({
  columns,
}: SkeletonRowProps) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-4">
          <div className="h-4 w-full rounded-md bg-muted" />
        </td>
      ))}
    </tr>
  );
}