"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { CHART_PRIMARY } from "@/features/analytics/chart-palette";
import type { AdminCountBucketDTO } from "@/types";
import { formatCount, formatShare } from "./helpers";

type DistributionBarListProps = {
  title: string;
  items: AdminCountBucketDTO[] | undefined;
  loading?: boolean;
  labelFor?: (key: string) => string;
  emptyMessage?: string;
  /** Rows beyond this are aggregated into an "Övriga" row. */
  maxRows?: number;
  footnote?: string;
};

type Row = { label: string; count: number };

function toRows(
  items: AdminCountBucketDTO[],
  labelFor: (key: string) => string,
  maxRows: number
): Row[] {
  const sorted = [...items].sort((a, b) => b.count - a.count);
  const visible = sorted
    .slice(0, maxRows)
    .map((item) => ({ label: labelFor(item.key), count: item.count }));
  const rest = sorted.slice(maxRows);
  if (rest.length > 0) {
    visible.push({
      label: `Övriga (${rest.length})`,
      count: rest.reduce((sum, item) => sum + item.count, 0),
    });
  }
  return visible;
}

/**
 * Horizontal magnitude bars for a categorical distribution. One hue for all
 * bars — identity is carried by the row label, the bar only encodes size.
 */
export function DistributionBarList({
  title,
  items,
  loading = false,
  labelFor = (key) => key,
  emptyMessage = "Ingen data att visa ännu.",
  maxRows = 8,
  footnote,
}: DistributionBarListProps) {
  const rows = toRows(items ?? [], labelFor, maxRows);
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const max = rows.reduce((acc, row) => Math.max(acc, row.count), 0);

  return (
    <div className="min-w-0">
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>

      {loading ? (
        <div className="mt-3 flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-8 w-full rounded-[6px]" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-3 rounded-[8px] border border-dashed border-[#dfe7e3] px-4 py-6 text-center text-sm text-[#66716f]">
          {emptyMessage}
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.label} className="min-w-0">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium text-[#111827]">
                  {row.label}
                </span>
                <span className="shrink-0 tabular-nums text-[#36534d]">
                  {formatCount(row.count)}
                  <span className="ml-1.5 text-xs text-[#66716f]">
                    {total > 0 ? formatShare(row.count / total) : ""}
                  </span>
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-[#edf2ef]">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${max > 0 ? Math.max((row.count / max) * 100, 2) : 0}%`,
                    backgroundColor: CHART_PRIMARY,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {footnote ? (
        <p className="mt-2 text-xs text-[#66716f]">{footnote}</p>
      ) : null}
    </div>
  );
}
