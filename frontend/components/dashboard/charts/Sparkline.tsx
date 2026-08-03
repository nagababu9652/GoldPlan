"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface Props {
  data: number[];
  color?: string;
  height?: number;
}

export default function Sparkline({
  data,
  color = "#2563eb",
  height = 60,
}: Props) {
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}