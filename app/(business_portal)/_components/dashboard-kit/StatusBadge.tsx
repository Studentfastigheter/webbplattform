"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "success" | "error" | "warning" | "info";

const toneClass: Record<BadgeTone, string> = {
  success: "bg-success-50 text-success-700",
  error: "bg-error-50 text-error-700",
  warning: "bg-amber-50 text-amber-700",
  info: "bg-brand-50 text-brand-600",
};

export default function StatusBadge({
  children,
  tone = "info",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClass[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

