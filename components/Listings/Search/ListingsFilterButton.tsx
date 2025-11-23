"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import AmenityGridSection from "@/components/Listings/filter_sections/AmenityGridSection";
import PriceRangeSection from "@/components/Listings/filter_sections/PriceRangeSection";
import PropertyTypeSection from "@/components/Listings/filter_sections/PropertyTypeSection";
import FilterButton, {
  type FilterButtonProps,
} from "./filterbutton";

type PriceBounds = {
  min: number;
  max: number;
};

export type ListingsFilterState = {
  amenities: string[];
  propertyType: string | null;
  priceRange: PriceBounds;
};

type ListingsFilterButtonProps = Omit<
  FilterButtonProps,
  "children" | "onApply" | "onClear"
> & {
  amenities?: { id: string; label: string; icon?: ReactNode }[];
  propertyTypes?: { id: string; label: string }[];
  priceHistogram?: number[];
  priceBounds?: PriceBounds;
  initialState?: ListingsFilterState;
  onApply?: (state: ListingsFilterState) => void;
  onClear?: () => void;
  onChange?: (state: ListingsFilterState) => void;
};

const defaultBounds: PriceBounds = { min: 0, max: 10000 };

const ListingsFilterButton: React.FC<ListingsFilterButtonProps> = ({
  amenities = [],
  propertyTypes = [],
  priceHistogram = [],
  priceBounds = defaultBounds,
  initialState,
  onApply,
  onClear,
  onChange,
  ...buttonProps
}) => {
  const resolvedInitial = useMemo<ListingsFilterState>(
    () =>
      initialState ?? {
        amenities: [],
        propertyType: null,
        priceRange: priceBounds,
      },
    [initialState, priceBounds]
  );

  const [state, setState] = useState<ListingsFilterState>(resolvedInitial);

  useEffect(() => {
    setState(resolvedInitial);
  }, [resolvedInitial]);

  const updateState = (next: ListingsFilterState) => {
    setState(next);
    onChange?.(next);
  };

  const handleAmenityToggle = (id: string) => {
    const exists = state.amenities.includes(id);
    const amenities = exists
      ? state.amenities.filter((item) => item !== id)
      : [...state.amenities, id];
    updateState({
      ...state,
      amenities,
    });
  };

  const handlePropertyType = (id: string | null) => {
    updateState({
      ...state,
      propertyType: id,
    });
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    const [rawMin, rawMax] = range;
    const nextRange: PriceBounds = {
      min: Math.min(rawMin, rawMax),
      max: Math.max(rawMin, rawMax),
    };

    updateState({
      ...state,
      priceRange: nextRange,
    });
  };

  const content = (
    <>
      <AmenityGridSection
        title="Rekommenderat för dig"
        description="Dessa värden kan fyllas med populär data från databasen."
        items={amenities}
        selectedIds={state.amenities}
        onToggle={handleAmenityToggle}
      />

      <PropertyTypeSection
        title="Boendetyp"
        items={propertyTypes}
        selectedId={state.propertyType}
        onSelect={handlePropertyType}
      />

      <PriceRangeSection
        title="Prisintervall"
        description="Resepris, inklusive alla avgifter."
        histogram={priceHistogram}
        bounds={priceBounds}
        value={[state.priceRange.min, state.priceRange.max]}
        onChange={(range) => handlePriceRangeChange(range)}
        withBorder={false}
      />
    </>
  );

  return (
    <FilterButton
      {...buttonProps}
      onClear={() => {
        updateState(resolvedInitial);
        onClear?.();
      }}
      onApply={() => {
        onApply?.(state);
      }}
    >
      {content}
    </FilterButton>
  );
};

export default ListingsFilterButton;
