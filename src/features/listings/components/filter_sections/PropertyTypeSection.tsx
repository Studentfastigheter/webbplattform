"use client";

import React from "react";
import { cn } from "@/lib/utils";
import FilterSectionShell from "./FilterSectionShell";

export type PropertyTypeItem = {
  id: string;
  label: string;
};

type PropertyTypeSectionProps = {
  title?: string;
  description?: string;
  items: PropertyTypeItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  counts?: Record<string, number>;
  withBorder?: boolean;
};

const PropertyTypeSection: React.FC<PropertyTypeSectionProps> = ({
  title,
  description,
  items,
  selectedId,
  onSelect,
  counts,
  withBorder = true,
}) => {
  return (
    <FilterSectionShell
      title={title}
      description={description}
      withBorder={withBorder}
    >
      <div className="flex flex-wrap gap-2">
        {items.map((type) => {
          const isActive = selectedId === type.id;
          const count = counts?.[type.id];
          const hasCount = typeof count === "number";
          const isEmpty = hasCount && count === 0;
          return (
            <button
              key={type.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(isActive ? null : type.id)}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition",
                isActive
                  ? "border-[#004225] bg-[#004225] text-white"
                  : isEmpty
                    ? "border-black/10 bg-white text-black/45 hover:border-black/25 hover:text-black/70"
                    : "border-black/10 bg-white text-black hover:border-[#004225]/30 hover:bg-[#f6faf8]"
              )}
            >
              <span>{type.label}</span>
              {hasCount && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : isEmpty
                        ? "bg-black/[0.03] text-black/40"
                        : "bg-[#004225]/10 text-[#004225]"
                  }`}
                >
                  {count.toLocaleString("sv-SE")}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </FilterSectionShell>
  );
};

export default PropertyTypeSection;
