"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const PORTAL_BAR_COLOR = "#465fff";
export const PORTAL_BAR_MUTED_COLOR = "#c7d2fe";
export const PORTAL_BAR_LINE_COLOR = "#f472b6";

type ChartMargin = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

type TooltipItem = {
  color?: unknown;
  dataKey?: unknown;
  payload?: {
    fill?: unknown;
  };
};

export type PortalBarChartDatum = {
  label: string;
  value: number;
  comparisonValue?: number;
  fill?: string;
  fullLabel?: string;
};

export type PortalBarLineChartDatum = {
  label: string;
  value: number;
  lineValue: number;
  fullLabel?: string;
};

type PortalBarChartCardProps = {
  action?: React.ReactNode;
  bodyClassName?: string;
  children: React.ReactNode;
  className?: string;
  description?: React.ReactNode;
  title: React.ReactNode;
};

type PortalVerticalBarChartProps = {
  barColor?: string;
  barSize?: number;
  chartClassName?: string;
  className?: string;
  comparisonBarColor?: string;
  comparisonLabel?: string;
  data: PortalBarChartDatum[];
  heightClassName?: string;
  labelFormatter?: (datum: PortalBarChartDatum) => React.ReactNode;
  margin?: ChartMargin;
  maxBarSize?: number;
  minWidthClassName?: string;
  showComparison?: boolean;
  useDatumFill?: boolean;
  valueFormatter?: (value: number) => React.ReactNode;
  valueLabel?: string;
  xAxisHeight?: number;
  xAxisInterval?: number | "preserveStartEnd";
  xAxisTickAngle?: number;
  yAxisWidth?: number;
};

type PortalHorizontalBarChartProps = {
  barColor?: string;
  barSize?: number;
  chartClassName?: string;
  className?: string;
  data: PortalBarChartDatum[];
  heightClassName?: string;
  labelAxisWidth?: number;
  labelFormatter?: (datum: PortalBarChartDatum) => React.ReactNode;
  margin?: ChartMargin;
  minWidthClassName?: string;
  useDatumFill?: boolean;
  valueFormatter?: (value: number) => React.ReactNode;
  valueLabel?: string;
};

type PortalBarLineChartProps = {
  barColor?: string;
  barLabel?: string;
  barSize?: number;
  chartClassName?: string;
  className?: string;
  data: PortalBarLineChartDatum[];
  heightClassName?: string;
  labelFormatter?: (datum: PortalBarLineChartDatum) => React.ReactNode;
  lineAxisFormatter?: (value: number) => string;
  lineColor?: string;
  lineFormatter?: (value: number) => React.ReactNode;
  lineLabel?: string;
  margin?: ChartMargin;
  minWidthClassName?: string;
  valueFormatter?: (value: number) => React.ReactNode;
};

function formatAxisValue(value: string | number) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 1000) {
    return String(value);
  }

  return `${numericValue / 1000}K`;
}

function defaultValueFormatter(value: number) {
  return value.toLocaleString("sv-SE");
}

function tooltipColor(item: TooltipItem, fallback: string) {
  const payloadFill = item.payload?.fill;
  const itemColor = item.color;

  if (typeof payloadFill === "string") return payloadFill;
  if (typeof itemColor === "string") return itemColor;

  return fallback;
}

function seriesFormatter({
  fallbackColor,
  labels,
  valueFormatter = defaultValueFormatter,
}: {
  fallbackColor: string;
  labels: Record<string, React.ReactNode>;
  valueFormatter?: (value: number) => React.ReactNode;
}) {
  return (value: unknown, name: unknown, item: TooltipItem) => {
    const numericValue = Number(value);
    const formattedValue = Number.isFinite(numericValue)
      ? valueFormatter(numericValue)
      : String(value ?? "");
    const dataKey = String(item.dataKey ?? name ?? "value");
    const fallbackLabel =
      typeof name === "string" || typeof name === "number" ? name : dataKey;
    const label = labels[dataKey] ?? fallbackLabel;

    return (
      <>
        <span
          aria-hidden="true"
          className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-[3px]"
          style={{ backgroundColor: tooltipColor(item, fallbackColor) }}
        />
        <span className="min-w-0 flex-1 text-muted-foreground">{label}</span>
        <span className="font-mono font-medium tabular-nums text-foreground">
          {formattedValue}
        </span>
      </>
    );
  };
}

function labelFromPayload<T extends { fullLabel?: string }>(
  payload: unknown[] | undefined,
  formatter?: (datum: T) => React.ReactNode
) {
  const row = payload?.[0] as { payload?: T } | undefined;
  const datum = row?.payload;

  if (!datum) return "";
  if (formatter) return formatter(datum);

  return datum.fullLabel ?? "";
}

export function PortalBarChartCard({
  action,
  bodyClassName,
  children,
  className,
  description,
  title,
}: PortalBarChartCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-gray-200 bg-white shadow-theme-xs",
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-3 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-base font-medium text-gray-800">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 max-w-[36rem] text-sm text-gray-500">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div
        className={cn(
          "border-t border-gray-100 p-5 sm:p-6",
          bodyClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function PortalBarChartSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <Skeleton
      className={cn("h-[220px] w-full rounded-xl bg-gray-100", className)}
    />
  );
}

export function PortalBarChartState({
  children,
  className,
  tone = "empty",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "empty" | "error";
}) {
  return (
    <div
      className={cn(
        "flex min-h-[180px] items-center justify-center rounded-xl px-4 text-center text-sm",
        tone === "error"
          ? "border border-error-500/20 bg-error-50 text-error-700"
          : "border border-dashed border-gray-200 bg-gray-50/60 text-gray-500",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PortalVerticalBarChart({
  barColor = PORTAL_BAR_COLOR,
  barSize,
  chartClassName,
  className,
  comparisonBarColor = PORTAL_BAR_MUTED_COLOR,
  comparisonLabel = "Comparison",
  data,
  heightClassName = "h-[220px]",
  labelFormatter,
  margin = { bottom: 0, left: 0, right: 8, top: 16 },
  maxBarSize = 28,
  minWidthClassName,
  showComparison = false,
  useDatumFill = false,
  valueFormatter = defaultValueFormatter,
  valueLabel = "Value",
  xAxisHeight,
  xAxisInterval,
  xAxisTickAngle = 0,
  yAxisWidth = 44,
}: PortalVerticalBarChartProps) {
  const config = React.useMemo<ChartConfig>(
    () => ({
      comparisonValue: {
        color: comparisonBarColor,
        label: comparisonLabel,
      },
      value: {
        color: barColor,
        label: valueLabel,
      },
    }),
    [barColor, comparisonBarColor, comparisonLabel, valueLabel]
  );
  const resolvedMinWidth =
    minWidthClassName ??
    (data.length > 12 ? "min-w-[720px]" : "min-w-full");
  const resolvedXAxisInterval =
    xAxisInterval ?? (data.length > 14 ? "preserveStartEnd" : 0);
  const tick = React.useMemo(
    () => {
      const textAnchor: "end" | "middle" =
        xAxisTickAngle < 0 ? "end" : "middle";

      return {
        angle: xAxisTickAngle,
        fill: "#667085",
        fontSize: 11,
        textAnchor,
      };
    },
    [xAxisTickAngle]
  );
  const tooltipFormatter = React.useMemo(
    () =>
      seriesFormatter({
        fallbackColor: barColor,
        labels: {
          comparisonValue: comparisonLabel,
          value: valueLabel,
        },
        valueFormatter,
      }),
    [barColor, comparisonLabel, valueFormatter, valueLabel]
  );

  return (
    <div className={cn("custom-scrollbar max-w-full overflow-x-auto", className)}>
      <ChartContainer
        className={cn(
          "aspect-auto w-full",
          heightClassName,
          resolvedMinWidth,
          chartClassName
        )}
        config={config}
      >
        <BarChart
          barCategoryGap={data.length > 12 ? "24%" : "34%"}
          barGap={4}
          data={data}
          margin={margin}
        >
          <CartesianGrid stroke="#e0e0e0" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="label"
            height={xAxisHeight}
            interval={resolvedXAxisInterval}
            minTickGap={8}
            tick={tick}
            tickLine={false}
            tickMargin={12}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tick={{ fill: "#667085", fontSize: 11 }}
            tickFormatter={formatAxisValue}
            tickLine={false}
            tickMargin={8}
            width={yAxisWidth}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={tooltipFormatter}
                labelFormatter={(_, payload) =>
                  labelFromPayload<PortalBarChartDatum>(payload, labelFormatter)
                }
              />
            }
            cursor={{ fill: "rgba(70, 95, 255, 0.06)" }}
          />
          {showComparison ? (
            <Bar
              dataKey="comparisonValue"
              fill="var(--color-comparisonValue)"
              maxBarSize={maxBarSize}
              name={comparisonLabel}
              radius={[6, 6, 0, 0]}
            />
          ) : null}
          <Bar
            barSize={barSize}
            dataKey="value"
            fill="var(--color-value)"
            maxBarSize={maxBarSize}
            name={valueLabel}
            radius={[6, 6, 0, 0]}
          >
            {useDatumFill
              ? data.map((entry, index) => (
                  <Cell
                    fill={entry.fill ?? barColor}
                    key={`${entry.label}-${index}`}
                  />
                ))
              : null}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export function PortalHorizontalBarChart({
  barColor = PORTAL_BAR_COLOR,
  barSize = 18,
  chartClassName,
  className,
  data,
  heightClassName = "h-[160px]",
  labelAxisWidth = 92,
  labelFormatter,
  margin = { bottom: 0, left: 8, right: 16, top: 4 },
  minWidthClassName = "min-w-full",
  useDatumFill = false,
  valueFormatter = defaultValueFormatter,
  valueLabel = "Value",
}: PortalHorizontalBarChartProps) {
  const config = React.useMemo<ChartConfig>(
    () => ({
      value: {
        color: barColor,
        label: valueLabel,
      },
    }),
    [barColor, valueLabel]
  );
  const tooltipFormatter = React.useMemo(
    () =>
      seriesFormatter({
        fallbackColor: barColor,
        labels: {
          value: valueLabel,
        },
        valueFormatter,
      }),
    [barColor, valueFormatter, valueLabel]
  );

  return (
    <div className={cn("custom-scrollbar max-w-full overflow-x-auto", className)}>
      <ChartContainer
        className={cn(
          "aspect-auto w-full",
          heightClassName,
          minWidthClassName,
          chartClassName
        )}
        config={config}
      >
        <BarChart data={data} layout="vertical" margin={margin}>
          <CartesianGrid horizontal={false} stroke="#e0e0e0" />
          <XAxis
            allowDecimals={false}
            axisLine={false}
            tick={{ fill: "#667085", fontSize: 11 }}
            tickFormatter={formatAxisValue}
            tickLine={false}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="label"
            tick={{ fill: "#667085", fontSize: 11 }}
            tickLine={false}
            type="category"
            width={labelAxisWidth}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={tooltipFormatter}
                labelFormatter={(_, payload) =>
                  labelFromPayload<PortalBarChartDatum>(payload, labelFormatter)
                }
              />
            }
            cursor={{ fill: "rgba(70, 95, 255, 0.06)" }}
          />
          <Bar
            barSize={barSize}
            dataKey="value"
            fill="var(--color-value)"
            name={valueLabel}
            radius={[0, 6, 6, 0]}
          >
            {useDatumFill
              ? data.map((entry, index) => (
                  <Cell
                    fill={entry.fill ?? barColor}
                    key={`${entry.label}-${index}`}
                  />
                ))
              : null}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export function PortalBarLineChart({
  barColor = PORTAL_BAR_COLOR,
  barLabel = "Value",
  barSize = 20,
  chartClassName,
  className,
  data,
  heightClassName = "h-[280px]",
  labelFormatter,
  lineAxisFormatter = (value) => `${value}%`,
  lineColor = PORTAL_BAR_LINE_COLOR,
  lineFormatter = defaultValueFormatter,
  lineLabel = "Share",
  margin = { bottom: 4, left: 4, right: 18, top: 8 },
  minWidthClassName,
  valueFormatter = defaultValueFormatter,
}: PortalBarLineChartProps) {
  const config = React.useMemo<ChartConfig>(
    () => ({
      lineValue: {
        color: lineColor,
        label: lineLabel,
      },
      value: {
        color: barColor,
        label: barLabel,
      },
    }),
    [barColor, barLabel, lineColor, lineLabel]
  );
  const resolvedMinWidth =
    minWidthClassName ??
    (data.length > 10 ? "min-w-[720px]" : "min-w-full");
  const tooltipFormatter = React.useMemo(
    () =>
      (value: unknown, name: unknown, item: TooltipItem) => {
        const dataKey = String(item.dataKey ?? name ?? "value");
        const numericValue = Number(value);
        const formatter =
          dataKey === "lineValue" ? lineFormatter : valueFormatter;
        const formattedValue = Number.isFinite(numericValue)
          ? formatter(numericValue)
          : String(value ?? "");
        const label = dataKey === "lineValue" ? lineLabel : barLabel;
        const fallbackColor =
          dataKey === "lineValue" ? lineColor : barColor;

        return (
          <>
            <span
              aria-hidden="true"
              className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-[3px]"
              style={{ backgroundColor: tooltipColor(item, fallbackColor) }}
            />
            <span className="min-w-0 flex-1 text-muted-foreground">
              {label}
            </span>
            <span className="font-mono font-medium tabular-nums text-foreground">
              {formattedValue}
            </span>
          </>
        );
      },
    [barColor, barLabel, lineColor, lineFormatter, lineLabel, valueFormatter]
  );

  return (
    <div className={cn("custom-scrollbar max-w-full overflow-x-auto", className)}>
      <ChartContainer
        className={cn(
          "aspect-auto w-full",
          heightClassName,
          resolvedMinWidth,
          chartClassName
        )}
        config={config}
      >
        <ComposedChart data={data} margin={margin}>
          <CartesianGrid stroke="#e0e0e0" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="label"
            interval={0}
            tick={{ fill: "#667085", fontSize: 11 }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tick={{ fill: "#667085", fontSize: 11 }}
            tickFormatter={formatAxisValue}
            tickLine={false}
            yAxisId="value"
          />
          <YAxis
            axisLine={false}
            orientation="right"
            tick={{ fill: "#667085", fontSize: 11 }}
            tickFormatter={(value) => lineAxisFormatter(Number(value))}
            tickLine={false}
            yAxisId="lineValue"
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={tooltipFormatter}
                labelFormatter={(_, payload) =>
                  labelFromPayload<PortalBarLineChartDatum>(
                    payload,
                    labelFormatter
                  )
                }
              />
            }
            cursor={{ fill: "rgba(70, 95, 255, 0.06)" }}
          />
          <Bar
            barSize={barSize}
            dataKey="value"
            fill="var(--color-value)"
            name={barLabel}
            radius={[6, 6, 0, 0]}
            yAxisId="value"
          />
          <Line
            dataKey="lineValue"
            dot={{ r: 3 }}
            name={lineLabel}
            stroke="var(--color-lineValue)"
            strokeWidth={2}
            yAxisId="lineValue"
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}
