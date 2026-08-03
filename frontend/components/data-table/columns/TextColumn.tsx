"use client";

interface Props {
  value?: string | null;
}

export default function TextColumn({
  value,
}: Props) {
  return (
    <span className="text-sm text-foreground">
      {value || "-"}
    </span>
  );
}