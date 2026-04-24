"use client";

import {
  Bar,
  BarChart,
  BarSeries,
  Gridline,
  GridlineSeries,
  LinearXAxis,
  LinearXAxisTickLabel,
  LinearXAxisTickSeries,
  LinearYAxis,
  LinearYAxisTickLabel,
  LinearYAxisTickSeries,
  Line,
  LineChart,
  LineSeries,
  PointSeries,
  ScatterPoint,
  type ChartNestedDataShape,
} from "reaviz";
import CardShell from "./CardShell";

export type MetricPeriodChartRow = {
  period: string;
  applications: number;
  viewings: number;
  interactions: number;
  activeListings: number;
};

export type MetricPeriodChangeRow = MetricPeriodChartRow;

const metrics = [
  { key: "viewings", label: "Visningar", color: "#2563eb" },
  { key: "interactions", label: "Interaktioner", color: "#c2410c" },
  { key: "applications", label: "Ansökningar", color: "#004225" },
  { key: "activeListings", label: "Aktiva annonser", color: "#64748b" },
] as const;

const chartColors = metrics.map((metric) => metric.color);

function toChartNumber(value: unknown) {
  const numberValue =
    typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getCategoryDomain(data: MetricPeriodChartRow[]) {
  return data.map((row) => String(row.period));
}

function toMetricSeriesData(data: MetricPeriodChartRow[]): ChartNestedDataShape[] {
  return metrics.map((metric) => ({
    key: metric.label,
    data: data.map((row) => ({
      key: String(row.period),
      data: toChartNumber(row[metric.key]),
    })),
  }));
}

function toPeriodGroupData(data: MetricPeriodChartRow[]): ChartNestedDataShape[] {
  return data.map((row) => ({
    key: String(row.period),
    data: metrics.map((metric) => ({
      key: metric.label,
      data: toChartNumber(row[metric.key]),
    })),
  }));
}

function ReavizLegend() {
  return (
    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
      {metrics.map((metric) => (
        <div className="flex items-center gap-2 text-theme-xs text-gray-600" key={metric.key}>
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: metric.color }} />
          <span>{metric.label}</span>
        </div>
      ))}
    </div>
  );
}

function valueYAxis(percent = false) {
  return (
    <LinearYAxis
      axisLine={null}
      scaled
      tickSeries={
        <LinearYAxisTickSeries
          line={null}
          label={
            <LinearYAxisTickLabel
              fill="#667085"
              fontSize={12}
              format={(value) => {
                const formattedValue = toChartNumber(value);

                return percent
                  ? `${formattedValue.toLocaleString("sv-SE", {
                      maximumFractionDigits: 0,
                    })}%`
                  : formattedValue.toLocaleString("sv-SE");
              }}
            />
          }
        />
      }
      type="value"
    />
  );
}

function categoryXAxis(domain?: string[]) {
  return (
    <LinearXAxis
      axisLine={null}
      domain={domain}
      tickSeries={
        <LinearXAxisTickSeries
          label={<LinearXAxisTickLabel fill="#667085" fontSize={12} />}
          line={null}
        />
      }
      type="category"
    />
  );
}

function gridLines() {
  return <GridlineSeries line={<Gridline direction="y" strokeColor="#e5e7eb" />} />;
}

export function MetricPeriodVolumeChartCard({ data }: { data: MetricPeriodChartRow[] }) {
  const chartData = toPeriodGroupData(data);
  const categoryDomain = getCategoryDomain(data);

  return (
    <CardShell
      className="xl:col-span-2"
      description="Jämför ansökningar, visningar, interaktioner och aktiva annonser över valbara perioder."
      title="Volymer per period"
    >
      <div className="max-w-full overflow-x-auto">
        <div className="h-[320px] min-w-[760px] xl:min-w-full">
          <BarChart
            data={chartData}
            gridlines={gridLines()}
            margins={24}
            series={
              <BarSeries
                bar={<Bar gradient={null} rx={5} ry={5} />}
                colorScheme={chartColors}
                padding={0.35}
                type="grouped"
              />
            }
            xAxis={categoryXAxis(categoryDomain)}
            yAxis={valueYAxis()}
          />
        </div>
      </div>
      <ReavizLegend />
    </CardShell>
  );
}

export function MetricPeriodChangeChartCard({ data }: { data: MetricPeriodChangeRow[] }) {
  const chartData = toMetricSeriesData(data);
  const categoryDomain = getCategoryDomain(data);

  return (
    <CardShell
      description="Procentuell förändring jämfört med föregående motsvarande period."
      title="Förändring"
    >
      <div className="max-w-full overflow-x-auto">
        <div className="h-[320px] min-w-[520px] xl:min-w-full">
          <LineChart
            data={chartData}
            gridlines={gridLines()}
            margins={24}
            series={
              <LineSeries
                colorScheme={chartColors}
                line={<Line strokeWidth={2.5} />}
                symbols={<PointSeries point={<ScatterPoint size={5} />} show />}
                type="grouped"
              />
            }
            xAxis={categoryXAxis(categoryDomain)}
            yAxis={valueYAxis(true)}
          />
        </div>
      </div>
      <ReavizLegend />
    </CardShell>
  );
}
