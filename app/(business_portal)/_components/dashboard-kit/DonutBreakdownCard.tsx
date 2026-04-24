"use client";

import { PieArc, PieArcSeries, PieChart, type ChartShallowDataShape } from "reaviz";
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
  const data: ChartShallowDataShape<number>[] = items.map((item) => ({
    key: item.label,
    data: item.value,
  }));
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <CardShell description={description} title={title}>
      <div className="relative h-[230px]">
        <PieChart
          data={data}
          margins={8}
          series={
            <PieArcSeries
              arc={<PieArc gradient={null} />}
              colorScheme={items.map((item) => item.color)}
              cornerRadius={4}
              doughnut
              label={null}
              padAngle={0.018}
            />
          }
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-theme-xs text-gray-500">Totalt</p>
            <p className="text-xl font-semibold text-gray-800">
              {total.toLocaleString("sv-SE")}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div className="flex items-center justify-between" key={item.label}>
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="truncate text-theme-sm text-gray-600">{item.label}</span>
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
