import GoalProgressCard from "./GoalProgressCard";
import GoalsSummary from "./GoalsSummary";
import GoalsTable from "./GoalsTable";

import { Goal } from "./types";

interface Props {
  goals: Goal[];
}

export default function ClientGoals({
  goals,
}: Props) {
  const target = goals.reduce(
    (sum, goal) => sum + goal.targetAmount,
    0
  );

  const current = goals.reduce(
    (sum, goal) => sum + goal.currentAmount,
    0
  );

  return (
    <div className="space-y-3">

      <GoalsSummary
        total={goals.length}
        target={target}
        current={current}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {goals.map((goal) => (
          <GoalProgressCard
            key={goal.id}
            goal={goal}
          />
        ))}
      </div>

      <GoalsTable goals={goals} />

    </div>
  );
}