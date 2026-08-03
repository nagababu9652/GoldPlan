"use client";

interface Props {
  value: string | number;
}

export default function KPIValue({
  value,
}: Props) {
  return (
    <div className="mt-4">

      <h2 className="text-3xl font-bold tracking-tight">
        {value}
      </h2>

    </div>
  );
}