"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import ChartContainer from "./base/ChartContainer";
import ChartTooltip from "./base/ChartTooltip";
import { BaseChartProps, ChartData } from "./base/types";
import { PIE_COLORS } from "./base/ChartColors";

interface Props extends BaseChartProps {
  data: ChartData[];
}

export default function DashboardPieChart({
  data,
  loading,
  height = 320,
}: Props) {
  return (
    <ChartContainer loading={loading} empty={!data.length}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}