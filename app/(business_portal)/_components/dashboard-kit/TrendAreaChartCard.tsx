"use client";

import {
  Area,
  AreaChart,
  AreaSeries,
  Gridline,
  GridlineSeries,
  LinearXAxis,
  LinearXAxisTickLabel,
  LinearXAxisTickSeries,
  LinearYAxis,
  LinearYAxisTickLabel,
  LinearYAxisTickSeries,
  Line,
  PointSeries,
  ScatterPoint,
  type ChartNestedDataShape,
} from "reaviz";
import CardShell from "./CardShell";

export type TrendSeries = {
  key: string;
  label: string;
  color: string;
  fillOpacity?: number;
};

function toChartNumber(value: unknown) {
  const numberValue =
    typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

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
  const categoryDomain = data.map((row) => String(row[xKey]));
  const chartData: ChartNestedDataShape[] = series.map((item) => ({
    key: item.label,
    data: data.map((row) => ({
      key: String(row[xKey]),
      data: toChartNumber(row[item.key]),
    })),
  }));

  return (
    <CardShell className="xl:col-span-2" description={description} title={title}>
      <div className="max-w-full overflow-x-auto">
        <div className="h-[320px] min-w-[760px] xl:min-w-full">
          <AreaChart
            data={chartData}
            gridlines={<GridlineSeries line={<Gridline direction="y" strokeColor="#e5e7eb" />} />}
            margins={24}
            series={
              <AreaSeries
                area={<Area gradient={null} />}
                colorScheme={series.map((item) => item.color)}
                interpolation="smooth"
                line={<Line strokeWidth={2.5} />}
                symbols={<PointSeries point={<ScatterPoint size={5} />} show />}
                type="grouped"
              />
            }
            xAxis={
              <LinearXAxis
                axisLine={null}
                domain={categoryDomain}
                tickSeries={
                  <LinearXAxisTickSeries
                    label={<LinearXAxisTickLabel fill="#667085" fontSize={12} />}
                    line={null}
                  />
                }
                type="category"
              />
            }
            yAxis={
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
                        format={(value) => toChartNumber(value).toLocaleString("sv-SE")}
                      />
                    }
                  />
                }
                type="value"
              />
            }
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {series.map((item) => (
          <div className="flex items-center gap-2 text-theme-xs text-gray-600" key={item.key}>
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}
