"use client";

import { Card } from "@/components/ui/card";

interface Props {
  total: number;
  verified: number;
  pending: number;
}

export default function DocumentsSummary({
  total,
  verified,
  pending,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">

      <Card className="p-5">
        <p className="text-sm text-muted-foreground">
          Total Documents
        </p>
        <h2 className="mt-2 text-3xl font-bold">
          {total}
        </h2>
      </Card>

      <Card className="p-5">
        <p className="text-sm text-muted-foreground">
          Verified
        </p>
        <h2 className="mt-2 text-3xl font-bold text-green-600">
          {verified}
        </h2>
      </Card>

      <Card className="p-5">
        <p className="text-sm text-muted-foreground">
          Pending Review
        </p>
        <h2 className="mt-2 text-3xl font-bold text-amber-600">
          {pending}
        </h2>
      </Card>

    </div>
  );
}