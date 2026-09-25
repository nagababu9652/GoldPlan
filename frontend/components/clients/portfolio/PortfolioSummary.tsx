"use client";

import { Card } from "@/components/ui/card";

interface Props {
  invested: number;
  current: number;
}

export default function PortfolioSummary({
  invested,
  current,
}: Props) {
  const gain = current - invested;

  return (
    <div className="grid gap-4 md:grid-cols-3">

      <Card className="p-5">
        <p className="text-sm text-muted-foreground">
          Invested Value
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          ₹{invested.toLocaleString("en-IN")}
        </h2>
      </Card>

      <Card className="p-5">
        <p className="text-sm text-muted-foreground">
          Current Value
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          ₹{current.toLocaleString("en-IN")}
        </h2>
      </Card>

      <Card className="p-5">
        <p className="text-sm text-muted-foreground">
          Overall Gain
        </p>

        <h2
          className={`mt-2 text-2xl font-bold ${
            gain >= 0
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          ₹{gain.toLocaleString("en-IN")}
        </h2>
      </Card>

    </div>
  );
}