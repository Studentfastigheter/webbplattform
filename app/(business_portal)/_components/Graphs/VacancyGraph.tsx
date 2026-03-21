"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import type { MetricKey } from "./vacancy-graph.types";
import {
  MOCK_TODAY,
  buildComparisonData,
  createMetricSourceData,
  getDisplayTotals,
  parseISODateUTC,
} from "./vacancy-graph.mock-data";
import Trend from "../Trend";

const chartConfig = {
  thisYear: {
    label: "I år",
    color: "var(--chart-2)",
  },
  lastYear: {
    label: "Förra året",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const metricMeta: Record<
  MetricKey,
  {
    title: string;
    description: string;
    toggleLabel: string;
    thisYearLabel: string;
    lastYearLabel: string;
  }
> = {
  views: {
    title: "Visningar",
    description: "Antal visningar detta år jämfört med förra året",
    toggleLabel: "Visningar",
    thisYearLabel: "Visningar i år",
    lastYearLabel: "Visningar förra året",
  },
  applications: {
    title: "Ansökningar",
    description: "Antal ansökningar detta år jämfört med förra året",
    toggleLabel: "Ansökningar",
    thisYearLabel: "Ansökningar i år",
    lastYearLabel: "Ansökningar förra året",
  },
  vacancies: {
    title: "Vakanser",
    description: "Antal vakanser detta år jämfört med förra året",
    toggleLabel: "Vakanser",
    thisYearLabel: "Vakanser i år",
    lastYearLabel: "Vakanser förra året",
  },
};

export default function VacancyGraph() {
  const [activeMetric, setActiveMetric] = React.useState<MetricKey>("views");

  const today = MOCK_TODAY;
  const currentYear = today.getUTCFullYear();

  const metricSourceData = React.useMemo(() => {
    return createMetricSourceData(today);
  }, [today]);

  const meta = metricMeta[activeMetric];
  const selected = metricSourceData[activeMetric];

  const comparisonData = React.useMemo(() => {
    return buildComparisonData(
      selected.thisYear,
      selected.lastYear,
      currentYear
    );
  }, [selected, currentYear]);

  const comparisonTotals = React.useMemo(() => {
    return getDisplayTotals(comparisonData, today);
  }, [comparisonData, today]);

  const fullYearTotals = React.useMemo(
    () => ({
      thisYear: selected.thisYear.reduce((acc, row) => acc + row.value, 0),
      lastYear: selected.lastYear.reduce((acc, row) => acc + row.value, 0),
    }),
    [selected]
  );

  return (
    <Card className="m-2 py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 mb-0">
        <div className="flex items-center justify-between gap-4 px-6 pt-4 pb-3">
          <div className="grid gap-1">
            <CardTitle className="text-2xl">{meta.title}</CardTitle>
            <CardDescription className="text-sm">
              {meta.description}
            </CardDescription>
          </div>

          <div className="flex">
            {(["views", "applications", "vacancies"] as const).map((metric) => {
              const metricMetaItem = metricMeta[metric];
              const metricSelected = metricSourceData[metric];

              const metricComparisonData = buildComparisonData(
                metricSelected.thisYear,
                metricSelected.lastYear,
                currentYear
              );

              const total = getDisplayTotals(metricComparisonData, today);

              return (
                <button
                  key={metric}
                  data-active={activeMetric === metric}
                  onClick={() => setActiveMetric(metric)}
                  className="cursor-pointer relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left transition-colors even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                >
                  <span className="text-xs text-muted-foreground">
                    {metricMetaItem.toggleLabel}
                  </span>

                  <span className="text-lg leading-none font-bold sm:text-3xl">
                    {total.toDate.thisYear.toLocaleString("sv-SE")}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    Förra året: {total.full.lastYear.toLocaleString("sv-SE")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid border-t sm:grid-cols-3">
          <div className="pb-4 flex flex-col justify-center gap-1 px-6 py-4">
            <span className="text-xs text-muted-foreground">
              {meta.thisYearLabel}
            </span>
            <div className="flex gap-3 items-center">
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {comparisonTotals.toDate.thisYear.toLocaleString("sv-SE")}
              </span>
              {
                comparisonTotals.comparison.percentChange !== null && (
                  <Trend 
                    changeInPercent={comparisonTotals.comparison.percentChange} 
                    increaseDirection={activeMetric === "vacancies" ? "down" : "up"}
                  />
                )
              }
            </div>
          </div>

          <div className="pb-4 flex flex-col justify-center gap-1 border-t px-6 py-4 sm:border-t-0 sm:border-l">
            <span className="text-xs text-muted-foreground">
              {meta.lastYearLabel}
            </span>
            <div className="flex items-center">
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {comparisonTotals.toDate.lastYear.toLocaleString("sv-SE")}
              </span>
              <span className="ml-3 text-xs text-muted-foreground">
                ({fullYearTotals.lastYear.toLocaleString("sv-SE")})
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart 
            data={comparisonData} 
            margin={{ left: 12, right: 12, bottom: 24 }}
          >
            <defs>
              <linearGradient id="fillThisYear" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-thisYear)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-thisYear)"
                  stopOpacity={0.15}
                />
              </linearGradient>

              <linearGradient id="fillLastYear" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-lastYear)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-lastYear)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
              tickFormatter={(value) => {
                const date = parseISODateUTC(String(value));
                return date.getUTCDate() === 1
                  ? date.toLocaleDateString("sv-SE", {
                      month: "short",
                      timeZone: "UTC",
                    })
                  : "";
              }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => Number(value).toLocaleString("sv-SE")}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) =>
                    parseISODateUTC(String(value)).toLocaleDateString("sv-SE", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    })
                  }
                />
              }
            />

            <Area
              dataKey="lastYear"
              type="monotone"
              fill="url(#fillLastYear)"
              stroke="var(--color-lastYear)"
              strokeWidth={2}
              connectNulls={false}
            />

            <Area
              dataKey="thisYear"
              type="monotone"
              fill="url(#fillThisYear)"
              stroke="var(--color-thisYear)"
              strokeWidth={2}
              connectNulls={false}
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}