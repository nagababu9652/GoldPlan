"use client";

interface Props {
  active?: boolean;

  payload?: {
    value: number;
    name: string;
  }[];

  label?: string;
}

export default function ChartTooltip({
  active,
  payload,
  label,
}: Props) {
  if (
    !active ||
    !payload?.length
  )
    return null;

  return (
    <div className="rounded-xl border bg-background p-3 shadow-lg">

      <p className="font-medium">

        {label}

      </p>

      <p className="text-primary">

        {payload[0].value}

      </p>

    </div>
  );
}