"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import CardShell from "./CardShell";

export type MetricPeriodChartRow = {
  period: string;
  applications: number;
  viewings: number;
  interactions: number;
  activeListings: number;
};

export type MetricPeriodChangeRow = MetricPeriodChartRow;

const chartConfig = {
  applications: {
    label: "Ansökningar",
    color: "#004225",
  },
  viewings: {
    label: "Visningar",
    color: "#2563eb",
  },
  interactions: {
    label: "Interaktioner",
    color: "#c2410c",
  },
  activeListings: {
    label: "Aktiva annonser",
    color: "#64748b",
  },
} satisfies ChartConfig;

export function MetricPeriodVolumeChartCard({
  data,
}: {
  data: MetricPeriodChartRow[];
}) {
  return (
    <CardShell
      className="xl:col-span-2"
      description="Jämför ansokningar, visningar, interaktioner och aktiva annonser över valbara perioder."
      title="Volymer per period"
    >
      <div className="max-w-full overflow-x-auto">
        <ChartContainer className="h-[320px] min-w-[760px] xl:min-w-full" config={chartConfig}>
          <BarChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis axisLine={false} dataKey="period" tickLine={false} tickMargin={8} />
            <YAxis axisLine={false} tickLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <Bar dataKey="viewings" fill="var(--color-viewings)" radius={[5, 5, 0, 0]} />
            <Bar dataKey="interactions" fill="var(--color-interactions)" radius={[5, 5, 0, 0]} />
            <Bar dataKey="applications" fill="var(--color-applications)" radius={[5, 5, 0, 0]} />
            <Bar dataKey="activeListings" fill="var(--color-activeListings)" radius={[5, 5, 0, 0]} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </div>
    </CardShell>
  );
}

export function MetricPeriodChangeChartCard({
  data,
}: {
  data: MetricPeriodChangeRow[];
}) {
  return (
    <CardShell
      description="Procentuell forandring jamfort med foregaende motsvarande period."
      title="Forandring"
    >
      <div className="max-w-full overflow-x-auto">
        <ChartContainer className="h-[320px] min-w-[520px] xl:min-w-full" config={chartConfig}>
          <LineChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis axisLine={false} dataKey="period" tickLine={false} tickMargin={8} />
            <YAxis
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={false}
              formatter={(value, name, item, index, payload) => (
                <div className="flex min-w-[150px] items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    {chartConfig[String(name) as keyof typeof chartConfig]?.label ?? name}
                  </span>
                  <span className="font-mono font-medium text-foreground tabular-nums">
                    {Number(value).toLocaleString("sv-SE", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </span>
                </div>
              )}
            />
            <Line
              dataKey="applications"
              dot
              stroke="var(--color-applications)"
              strokeWidth={2}
              type="monotone"
            />
            <Line
              dataKey="viewings"
              dot
              stroke="var(--color-viewings)"
              strokeWidth={2}
              type="monotone"
            />
            <Line
              dataKey="interactions"
              dot
              stroke="var(--color-interactions)"
              strokeWidth={2}
              type="monotone"
            />
            <Line
              dataKey="activeListings"
              dot
              stroke="var(--color-activeListings)"
              strokeWidth={2}
              type="monotone"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </div>
    </CardShell>
  );
}
