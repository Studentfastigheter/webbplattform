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
  withBorder?: boolean;
};

const PropertyTypeSection: React.FC<PropertyTypeSectionProps> = ({
  title,
  description,
  items,
  selectedId,
  onSelect,
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
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelect(isActive ? null : type.id)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                isActive
                  ? "border-black bg-black text-white"
                  : "border-black/15 text-black hover:border-black/40"
              }`}
            >
              {type.label}
            </button>
          );
        })}
      </div>
    </FilterSectionShell>
  );
};

export default PropertyTypeSection;
