"use client";

import { Card } from "@/components/ui/card";

interface Props {
  total: number;
  important: number;
}

export default function TimelineSummary({
  total,
  important,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">

      <Card className="p-5">
        <p>Total Activities</p>
        <h2 className="mt-2 text-3xl font-bold">
          {total}
        </h2>
      </Card>

      <Card className="p-5">
        <p>Important Events</p>
        <h2 className="mt-2 text-3xl font-bold">
          {important}
        </h2>
      </Card>

    </div>
  );
}