"use client";

import React from "react";
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
              onClick={() => onToggle(item.id)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                active
                  ? "border-black bg-black text-white"
                  : "border-black/15 text-black hover:border-black/40"
              }`}
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
