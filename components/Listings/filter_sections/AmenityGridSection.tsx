"use client";

import React, { type ReactNode } from "react";
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => {
          const active = selectedIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className={`flex flex-col items-center rounded-3xl border px-3 py-4 text-center transition ${
                active
                  ? "border-black bg-black text-white"
                  : "border-black/10 hover:border-black/30"
              }`}
            >
              <span className="text-2xl">{item.icon ?? "•"}</span>
              <span className="mt-2 text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </FilterSectionShell>
  );
};

export default AmenityGridSection;
