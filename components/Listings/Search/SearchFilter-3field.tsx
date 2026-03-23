"use client";

import React from "react";
import SearchFilterBar, {
  FilterField,
  Option,
  FieldValue,
} from "./SearchFilterBar";

import ListingsFilterButton, { ListingsFilterState } from "./ListingsFilterButton";

type ThreeFieldConfig = {
  id: string;
  label: string;
  placeholder: string;
  options: Option[];
  searchable?: boolean;
  multiple?: boolean;
};

export type ThreeFieldSearchProps = {
  field1: ThreeFieldConfig;
  field2: ThreeFieldConfig;
  field3: ThreeFieldConfig;
  onSubmit: (values: Record<string, FieldValue>) => void;
  className?: string;

  // Filter props
  amenities?: { id: string; label: string; icon?: React.ReactNode }[];
  propertyTypes?: { id: string; label: string }[];
  priceHistogram?: number[];
  priceBounds?: { min: number; max: number };
  initialState?: ListingsFilterState;
  onApply?: (state: ListingsFilterState) => void;
  onClear?: () => void;
};

const ThreeFieldSearch: React.FC<ThreeFieldSearchProps> = ({
  field1,
  field2,
  field3,
  onSubmit,
  className,
  amenities,
  propertyTypes,
  priceHistogram,
  priceBounds,
  initialState,
  onApply,
  onClear,
}) => {
  const fields: FilterField[] = [
    { type: "select", ...field1 },
    { type: "select", ...field2 },
    { type: "select", ...field3 },
  ];

  return (
    <SearchFilterBar
      fields={fields}
      onSubmit={onSubmit}
      className={className}
      renderFilter={() => (
        <ListingsFilterButton
          variant="outline"
          size="sm"
          className="w-full md:w-auto md:border-none md:bg-transparent md:hover:bg-transparent flex items-center justify-center h-[44px] md:h-[48px] rounded-full gap-2 text-sm font-semibold md:p-0"
          triggerLabel={
            <>
              <span className="block md:hidden">Filtrera</span>
              <span className="sr-only">Filtrera</span>
            </>
          }
          amenities={amenities}
          propertyTypes={propertyTypes}
          priceHistogram={priceHistogram}
          priceBounds={priceBounds}
          initialState={initialState}
          onApply={onApply}
          onClear={onClear}
        />
      )}
    />
  );
};

export default ThreeFieldSearch;
