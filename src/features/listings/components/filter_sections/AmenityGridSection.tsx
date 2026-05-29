"use client";

import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import FilterSectionShell from "./FilterSectionShell";

export type AmenityItem = {
  id: string;
  label: string;
  icon?: ReactNode;
};

type AmenityGridSectionProps = {
  title?: string;
  description?: string;
  items: AmenityItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  withBorder?: boolean;
};

const AmenityGridSection: React.FC<AmenityGridSectionProps> = ({
  title,
  description,
  items,
  selectedIds,
  onToggle,
  withBorder = true,
}) => {
  return (
    <FilterSectionShell
      title={title}
      description={description}
      withBorder={withBorder}
    >
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active = selectedIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(item.id)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                active
                  ? "border-[#004225] bg-[#004225] text-white"
                  : "border-black/10 bg-white text-black hover:border-[#004225]/30 hover:bg-[#f6faf8]"
              }`}
            >
              <span
                aria-hidden
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center",
                  active
                    ? "text-white"
                    : "text-[#004225]"
                )}
              >
                {item.icon ?? (
                  <span className="text-xs font-semibold uppercase">
                    {item.label.slice(0, 1)}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </FilterSectionShell>
  );
};

export default AmenityGridSection;
