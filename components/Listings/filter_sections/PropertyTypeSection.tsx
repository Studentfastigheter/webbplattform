"use client";

import React from "react";
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
              onClick={() => onSelect(isActive ? null : type.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                isActive
                  ? "border-black bg-black text-white"
                  : isEmpty
                    ? "border-black/10 text-black/45 hover:border-black/25 hover:text-black/70"
                    : "border-black/15 text-black hover:border-black/40"
              }`}
            >
              <span>{type.label}</span>
              {hasCount && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : isEmpty
                        ? "bg-black/[0.03] text-black/40"
                        : "bg-black/5 text-black/60"
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
