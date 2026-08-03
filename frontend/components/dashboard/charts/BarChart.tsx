"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import ChartContainer from "./base/ChartContainer";
import ChartTooltip from "./base/ChartTooltip";
import { BaseChartProps, ChartData } from "./base/types";
import { CHART_COLORS } from "./base/ChartColors";

interface Props extends BaseChartProps {
  data: ChartData[];
  dataKey?: string;
}

export default function DashboardBarChart({
  data,
  dataKey = "value",
  loading,
  height = 320,
}: Props) {
  return (
    <ChartContainer loading={loading} empty={!data.length}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<ChartTooltip />} />
          <Bar
            dataKey={dataKey}
            fill={CHART_COLORS.primary}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}