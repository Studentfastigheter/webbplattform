"use client";

import React from "react";
import { cn } from "@/lib/utils";
import FilterSectionShell from "./FilterSectionShell";

export type ChipCloudItem = {
  id: string;
  label: string;
  count?: number;
};

type ChipCloudSectionProps = {
  title?: string;
  description?: string;
  items: ChipCloudItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  withBorder?: boolean;
};

const ChipCloudSection: React.FC<ChipCloudSectionProps> = ({
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
              className={cn(
                "rounded-lg border px-3.5 py-2 text-sm font-medium transition",
                active
                  ? "border-[#004225] bg-[#004225] text-white shadow-[0_6px_14px_rgba(0,66,37,0.14)]"
                  : "border-black/10 bg-white text-black hover:border-[#004225]/30 hover:bg-[#f6faf8]"
              )}
            >
              <span>{item.label}</span>
              {typeof item.count === "number" && (
                <span
                  className={`ml-2 text-xs ${
                    active ? "text-white/80" : "text-black/60"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </FilterSectionShell>
  );
};

export default ChipCloudSection;
