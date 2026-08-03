import { LucideIcon } from "lucide-react";

export interface KPIWidgetProps {
  title: string;

  value: string | number;

  icon?: LucideIcon;

  trend?: number;

  trendLabel?: string;

  color?:
    | "primary"
    | "success"
    | "warning"
    | "danger";

  loading?: boolean;

  sparkline?: number[];

  footer?: React.ReactNode;

  onClick?: () => void;
}