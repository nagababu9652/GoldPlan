import { HTMLAttributes, ReactNode } from "react";

export type TrendType =
  | "up"
  | "down"
  | "neutral";

export interface StatCardProps
  extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;

  icon?: ReactNode;

  trend?: TrendType;

  trendValue?: string;

  description?: string;
}