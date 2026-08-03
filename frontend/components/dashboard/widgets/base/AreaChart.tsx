"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
} from "recharts";

import {
  BaseChartProps,
  ChartData,
} from "./base/types";

import ChartContainer from "./base/ChartContainer";

import ChartTooltip from "./base/ChartTooltip";

import { CHART_COLORS } from "./base/ChartColors";

interface Props extends BaseChartProps {
  data: ChartData[];

  dataKey?: string;
}

export default function DashboardAreaChart({
  data,
  dataKey = "value",
  loading,
  height = 320,
}: Props) {
  return (
    <ChartContainer
      loading={loading}
      empty={!data.length}
    >
      <ResponsiveContainer
        width="100%"
        height={height}
      >
        <AreaChart data={data}>

          <CartesianGrid
            stroke={CHART_COLORS.grid}
            strokeDasharray="3 3"
          />

          <XAxis dataKey="name" />

          <Tooltip
            content={<ChartTooltip />}
          />

          <Area
            dataKey={dataKey}
            stroke={CHART_COLORS.primary}
            fill={CHART_COLORS.primary}
            fillOpacity={0.15}
          />

        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}