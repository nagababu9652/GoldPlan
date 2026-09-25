"use client";

import { Card } from "@/components/ui/card";

import { Goal } from "./types";

interface Props {
  goal: Goal;
}

export default function GoalProgressCard({
  goal,
}: Props) {
  return (
    <Card className="p-5">

      <div className="flex items-center justify-between">

        <div>

          <h3 className="font-semibold">
            {goal.name}
          </h3>

          <p className="text-sm text-muted-foreground">
            {goal.category}
          </p>

        </div>

        <span className="text-lg font-bold">
          {goal.progress}%
        </span>

      </div>

      <div className="mt-4 h-2 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary"
          style={{
            width: `${goal.progress}%`,
          }}
        />
      </div>

      <div className="mt-4 flex justify-between text-sm">

        <span>
          ₹{goal.currentAmount.toLocaleString("en-IN")}
        </span>

        <span>
          ₹{goal.targetAmount.toLocaleString("en-IN")}
        </span>

      </div>

    </Card>
  );
}