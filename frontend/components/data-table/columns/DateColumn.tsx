"use client";

import { formatDate } from "./helpers";

interface Props {
  value: string | Date;
}

export default function DateColumn({
  value,
}: Props) {
  return (
    <span>
      {formatDate(value)}
    </span>
  );
}