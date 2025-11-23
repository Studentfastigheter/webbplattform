"use client";

import React from "react";
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
              onClick={() => onSelect(active ? null : item.id)}
              className={`flex flex-col rounded-3xl border px-4 py-3 text-left transition ${
                active
                  ? "border-black bg-black text-white"
                  : "border-black/15 hover:border-black/40"
              }`}
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
