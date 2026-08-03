export interface ChartData {
  name: string;

  value: number;

  [key: string]: unknown;
}

export interface BaseChartProps {
  title?: string;

  loading?: boolean;

  height?: number;

  className?: string;
}