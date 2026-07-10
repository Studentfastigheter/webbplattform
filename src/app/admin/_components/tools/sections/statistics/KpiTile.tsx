"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function KpiTile({
  label,
  value,
  hint,
  loading = false,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-[8px] border border-[#dfe7e3] bg-[#fbfcfb] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#476e66]">
        {label}
      </p>
      {loading ? (
        <Skeleton className="mt-2 h-9 w-20 rounded-[6px]" />
      ) : (
        <p className="mt-2 truncate text-3xl font-semibold text-[#111827]">
          {value}
        </p>
      )}
      {hint && !loading ? (
        <p className="mt-1 text-xs text-[#66716f]">{hint}</p>
      ) : null}
    </div>
  );
}
