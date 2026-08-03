"use client";

interface Props {
  data?: number[];
}

export default function KPISparkline({
  data,
}: Props) {
  if (!data) return null;

  return (
    <div className="mt-4 h-12 rounded-lg bg-muted" />
  );
}