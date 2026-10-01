import {
  FinancialGoal,
  archiveFinancialGoal,
  createFinancialGoal,
  getClientGoals,
  updateFinancialGoal,
} from "@/lib/api";
import { Goal } from "./types";

export function toDisplayGoal(goal: FinancialGoal): Goal {
  return {
    id: String(goal.id),
    name: goal.title,
    category: goal.goal_type.replace(/_/g, " "),
    targetAmount: Number(goal.target_amount),
    currentAmount: Number(goal.current_amount),
    targetDate: goal.target_date,
    expectedReturn: Number(goal.expected_return_rate ?? 0),
    progress: Number(goal.progress_percentage),
    status: ({
      ACTIVE: "Active",
      ON_TRACK: "On Track",
      NEEDS_ATTENTION: "Needs Attention",
      ACHIEVED: "Achieved",
      PAUSED: "Paused",
      CANCELLED: "Cancelled",
    } as const)[goal.status],
  };
}

export {
  archiveFinancialGoal,
  createFinancialGoal,
  getClientGoals,
  updateFinancialGoal,
};
