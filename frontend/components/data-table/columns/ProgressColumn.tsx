"use client";

import { Progress } from "@/components/ui/progress";

interface Props {
  value: number;
}

export default function ProgressColumn({
  value,
}: Props) {
  return (
    <div className="w-36">
      <Progress value={value} />
    </div>
  );
}