"use client";

import Image from "next/image";
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
  type ChartShallowDataShape,
} from "reaviz";
import CardShell from "./CardShell";
import StatusBadge from "./StatusBadge";

export type TopListingRow = {
  id: number | string;
  name: string;
  meta: string;
  imageUrl?: string;
  applications: number;
  share: string;
  statusLabel: string;
  statusTone: "success" | "warning" | "error" | "info";
};

export default function TopListingsTableCard({
  title,
  description,
  rows,
}: {
  title: string;
  description?: string;
  rows: TopListingRow[];
}) {
  const chartRows: ChartShallowDataShape<number>[] = rows.slice(0, 6).map((row) => ({
    key: row.name,
    data: row.applications,
  }));

  return (
    <CardShell className="xl:col-span-2" description={description} title={title}>
      {chartRows.length > 0 ? (
        <div className="mb-6 h-[260px]">
          <BarChart
            data={chartRows}
            gridlines={<GridlineSeries line={<Gridline direction="x" strokeColor="#e5e7eb" />} />}
            margins={28}
            series={
              <BarSeries
                bar={<Bar gradient={null} rx={5} ry={5} />}
                colorScheme={["#004225"]}
                layout="horizontal"
                padding={0.18}
              />
            }
            xAxis={
              <LinearXAxis
                axisLine={null}
                scaled
                tickSeries={
                  <LinearXAxisTickSeries
                    label={
                      <LinearXAxisTickLabel
                        fill="#667085"
                        fontSize={12}
                        format={(value) => Number(value).toLocaleString("sv-SE")}
                      />
                    }
                    line={null}
                  />
                }
                type="value"
              />
            }
            yAxis={
              <LinearYAxis
                axisLine={null}
                tickSeries={
                  <LinearYAxisTickSeries
                    ellipsisLength={22}
                    label={<LinearYAxisTickLabel fill="#344054" fontSize={12} />}
                    line={null}
                  />
                }
                type="category"
              />
            }
          />
        </div>
      ) : null}

      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead className="border-y border-gray-100">
            <tr>
              {["Objekt", "Ansökningar", "Andel", "Status"].map((heading) => (
                <th className="py-3 text-theme-xs font-medium text-gray-500" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-100">
                      <Image
                        alt={row.name}
                        className="h-[50px] w-[50px] object-cover"
                        height={50}
                        src={row.imageUrl ?? "/appartment.jpg"}
                        width={50}
                      />
                    </div>
                    <div>
                      <p className="text-theme-sm font-medium text-gray-800">{row.name}</p>
                      <span className="text-theme-xs text-gray-500">{row.meta}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-theme-sm text-gray-500">
                  {row.applications.toLocaleString("sv-SE")}
                </td>
                <td className="py-3 text-theme-sm text-gray-500">{row.share}</td>
                <td className="py-3">
                  <StatusBadge tone={row.statusTone}>{row.statusLabel}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  );
}
