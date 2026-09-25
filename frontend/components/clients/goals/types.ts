export type GoalStatus =
  | "On Track"
  | "Needs Attention"
  | "Achieved";

export interface Goal {

  id: string;

  name: string;

  category: string;

  targetAmount: number;

  currentAmount: number;

  targetDate: string;

  expectedReturn: number;

  progress: number;

  status: GoalStatus;

}