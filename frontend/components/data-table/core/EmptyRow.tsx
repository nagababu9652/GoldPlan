"use client";

interface EmptyRowProps {
  colSpan: number;
  message?: string;
}

export default function EmptyRow({
  colSpan,
  message = "No records found.",
}: EmptyRowProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-16 text-center text-sm text-ash"
      >
        {message}
      </td>
    </tr>
  );
}