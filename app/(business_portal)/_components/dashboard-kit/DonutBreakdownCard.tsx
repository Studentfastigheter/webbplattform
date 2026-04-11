"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import CardShell from "./CardShell";

export type DonutBreakdownItem = {
  label: string;
  value: number;
  color: string;
};

export default function DonutBreakdownCard({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: DonutBreakdownItem[];
}) {
  const chartConfig: ChartConfig = items.reduce<ChartConfig>((acc, item, index) => {
    acc[`segment_${index}`] = {
      label: item.label,
      color: item.color,
    };
    return acc;
  }, {});

  const data = items.map((item, index) => ({
    ...item,
    key: `segment_${index}`,
  }));

  return (
    <CardShell description={description} title={title}>
      <ChartContainer className="h-[220px]" config={chartConfig}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={58} outerRadius={86} paddingAngle={3}>
            {data.map((item) => (
              <Cell fill={item.color} key={item.key} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        </PieChart>
      </ChartContainer>

      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div className="flex items-center justify-between" key={item.label}>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-theme-sm text-gray-600">{item.label}</span>
            </div>
            <span className="text-theme-sm font-medium text-gray-800">
              {item.value.toLocaleString("sv-SE")}
            </span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

