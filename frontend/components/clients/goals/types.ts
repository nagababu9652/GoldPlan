export type GoalDisplayStatus =
  | "Active"
  | "On Track"
  | "Needs Attention"
  | "Achieved"
  | "Paused"
  | "Cancelled";

export interface Goal {

  id: string;

  name: string;

  category: string;

  targetAmount: number;

  currentAmount: number;

  targetDate: string;

  expectedReturn: number;

  progress: number;

  status: GoalDisplayStatus;

}
