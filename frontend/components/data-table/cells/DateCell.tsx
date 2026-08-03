"use client";

interface DateCellProps {
  value: string | Date;
}

export default function DateCell({
  value,
}: DateCellProps) {
  const date = new Date(value);

  return (
    <span>
      {date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}
    </span>
  );
}