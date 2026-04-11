"use client";

import { useId, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import CardShell from "./CardShell";

export type TrendSeries = {
  key: string;
  label: string;
  color: string;
  fillOpacity?: number;
};

export default function TrendAreaChartCard({
  title,
  description,
  data,
  xKey = "period",
  series,
}: {
  title: string;
  description?: string;
  data: Array<Record<string, string | number>>;
  xKey?: string;
  series: TrendSeries[];
}) {
  const chartId = useId().replace(/:/g, "");
  const chartConfig = useMemo<ChartConfig>(() => {
    const config: ChartConfig = {};
    series.forEach((item) => {
      config[item.key] = {
        label: item.label,
        color: item.color,
      };
    });
    return config;
  }, [series]);

  return (
    <CardShell className="xl:col-span-2" description={description} title={title}>
      <div className="max-w-full overflow-x-auto">
        <ChartContainer className="h-[320px] min-w-[760px] xl:min-w-full" config={chartConfig}>
          <AreaChart data={data} margin={{ left: 12, right: 12 }}>
            <defs>
              {series.map((item) => {
                const gradientId = `${chartId}-${item.key}`;
                const opacity = item.fillOpacity ?? 0.28;

                return (
                  <linearGradient id={gradientId} key={gradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor={`var(--color-${item.key})`} stopOpacity={opacity} />
                    <stop offset="95%" stopColor={`var(--color-${item.key})`} stopOpacity={0} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis axisLine={false} dataKey={xKey} tickLine={false} tickMargin={8} />
            <YAxis axisLine={false} tickLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={false} />
            {series.map((item, index) => {
              const gradientId = `${chartId}-${item.key}`;
              const isSecondary = index > 0;

              return (
                <Area
                  dataKey={item.key}
                  fill={isSecondary ? "transparent" : `url(#${gradientId})`}
                  key={item.key}
                  stroke={`var(--color-${item.key})`}
                  strokeWidth={2}
                  type="natural"
                />
              );
            })}
          </AreaChart>
        </ChartContainer>
      </div>
    </CardShell>
  );
}

