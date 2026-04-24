"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Count } from "reaviz";
import StatusBadge, { type BadgeTone } from "./StatusBadge";

export default function MetricCard({
  label,
  value,
  countValue,
  change,
  direction = "up",
  icon,
}: {
  label: string;
  value?: string;
  countValue?: number;
  change?: string;
  direction?: "up" | "down";
  icon: ReactNode;
}) {
  const tone: BadgeTone = direction === "up" ? "success" : "error";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-800">
        {icon}
      </div>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <span className="text-sm text-gray-500">{label}</span>
          <h4 className="mt-2 text-title-sm font-bold text-gray-800">
            {typeof countValue === "number" ? (
              <Count decimalPlaces={0} to={countValue} />
            ) : (
              value
            )}
          </h4>
        </div>
        {change ? (
          <StatusBadge tone={tone}>
            {direction === "up" ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5" />
            )}
            {change}
          </StatusBadge>
        ) : null}
      </div>
    </div>
  );
}

