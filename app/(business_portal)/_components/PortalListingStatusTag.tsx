"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PortalListingStatusTone = "success" | "warning" | "neutral";

const toneClassMap: Record<PortalListingStatusTone, string> = {
  success:
    "border-white/70 bg-white/90 text-emerald-700 ring-emerald-500/15",
  warning: "border-white/70 bg-white/90 text-amber-700 ring-amber-500/15",
  neutral: "border-white/70 bg-white/90 text-gray-700 ring-gray-500/15",
};

export default function PortalListingStatusTag({
  label,
  tone,
  className,
}: {
  label: ReactNode;
  tone: PortalListingStatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-2.5 text-[11px] font-semibold leading-none shadow-[0_8px_22px_rgba(15,23,42,0.16)] ring-1 backdrop-blur-md",
        toneClassMap[tone],
        className
      )}
    >
      {label}
    </span>
  );
}
