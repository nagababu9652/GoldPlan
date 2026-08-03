"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
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

export default function DashboardLineChart({
  data,
  dataKey = "value",
  loading,
  height = 320,
}: Props) {
  return (
    <ChartContainer loading={loading} empty={!data.length}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={CHART_COLORS.primary}
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}