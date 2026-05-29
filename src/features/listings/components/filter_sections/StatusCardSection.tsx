"use client";

import React from "react";
import { cn } from "@/lib/utils";
import FilterSectionShell from "./FilterSectionShell";

export type StatusCardItem = {
  id: string;
  label: string;
  description?: string;
};

type StatusCardSectionProps = {
  title?: string;
  description?: string;
  items: StatusCardItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  withBorder?: boolean;
};

const StatusCardSection: React.FC<StatusCardSectionProps> = ({
  title,
  description,
  items,
  selectedId,
  onSelect,
  withBorder = false,
}) => {
  return (
    <FilterSectionShell
      title={title}
      description={description}
      withBorder={withBorder}
    >
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const active = selectedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(active ? null : item.id)}
              className={cn(
                "flex flex-col rounded-lg border px-4 py-3 text-left transition",
                active
                  ? "border-[#004225] bg-[#004225] text-white shadow-[0_6px_14px_rgba(0,66,37,0.14)]"
                  : "border-black/10 bg-white text-black hover:border-[#004225]/30 hover:bg-[#f6faf8]"
              )}
            >
              <span className="text-sm font-semibold">{item.label}</span>
              {item.description && (
                <span
                  className={`text-xs ${
                    active ? "text-white/80" : "text-black/60"
                  }`}
                >
                  {item.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </FilterSectionShell>
  );
};

export default StatusCardSection;
