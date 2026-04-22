"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import AmenityGridSection from "@/components/Listings/filter_sections/AmenityGridSection";
import FilterSectionShell from "@/components/Listings/filter_sections/FilterSectionShell";
import PriceRangeSection from "@/components/Listings/filter_sections/PriceRangeSection";
import PropertyTypeSection from "@/components/Listings/filter_sections/PropertyTypeSection";
import FilterButton, {
  type FilterButtonProps,
} from "./filterbutton";

type PriceBounds = {
  min: number;
  max: number;
};

type SchoolOption = {
  id: number;
  name: string;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export type ListingsFilterState = {
  city: string;
  amenities: string[];
  propertyType: string | null;
  priceRange: PriceBounds;
  hostType: string | null;
  schoolId: number | null;
  schoolLat: number | null;
  schoolLng: number | null;
};

type ListingsFilterButtonProps = Omit<
  FilterButtonProps,
  "children" | "onApply" | "onClear"
> & {
  amenities?: { id: string; label: string; icon?: ReactNode }[];
  propertyTypes?: { id: string; label: string }[];
  hostTypes?: { id: string; label: string }[];
  schools?: SchoolOption[];
  priceHistogram?: number[];
  priceBounds?: PriceBounds;
  showPriceFilter?: boolean;
  initialState?: ListingsFilterState;
  onApply?: (state: ListingsFilterState) => void;
  onClear?: () => void;
  onChange?: (state: ListingsFilterState) => void;
};

const defaultBounds: PriceBounds = { min: 0, max: 10000 };

const emptyState = (priceBounds: PriceBounds): ListingsFilterState => ({
  city: "",
  amenities: [],
  propertyType: null,
  priceRange: priceBounds,
  hostType: null,
  schoolId: null,
  schoolLat: null,
  schoolLng: null,
});

const parseCoordinate = (value: string) => {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

const ListingsFilterButton: React.FC<ListingsFilterButtonProps> = ({
  amenities = [],
  propertyTypes = [],
  hostTypes = [],
  schools = [],
  priceHistogram = [],
  priceBounds = defaultBounds,
  showPriceFilter = true,
  initialState,
  onApply,
  onClear,
  onChange,
  ...buttonProps
}) => {
  const resolvedInitial = useMemo<ListingsFilterState>(
    () => initialState ?? emptyState(priceBounds),
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

  const handleCityChange = (city: string) => {
    updateState({
      ...state,
      city,
    });
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

  const handleHostType = (id: string | null) => {
    updateState({
      ...state,
      hostType: id,
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

  const handleSchoolSelect = (rawId: string) => {
    if (!rawId) {
      updateState({
        ...state,
        schoolId: null,
        schoolLat: null,
        schoolLng: null,
      });
      return;
    }

    const id = Number(rawId);
    const school = schools.find((item) => item.id === id);

    updateState({
      ...state,
      schoolId: Number.isFinite(id) ? id : null,
      schoolLat: typeof school?.lat === "number" ? school.lat : null,
      schoolLng: typeof school?.lng === "number" ? school.lng : null,
    });
  };

  const handleSchoolCoordinateChange = (
    key: "schoolLat" | "schoolLng",
    value: string
  ) => {
    updateState({
      ...state,
      [key]: parseCoordinate(value),
      schoolId: null,
    });
  };

  const content = (
    <>
      <FilterSectionShell
        title="Plats"
        description="Filtrerar mot API-parametern city."
      >
        <label className="space-y-2">
          <span className="block text-sm font-medium text-black/75">Stad</span>
          <input
            type="text"
            value={state.city}
            onChange={(event) => handleCityChange(event.target.value)}
            placeholder="Ex. Linköping"
            className="h-11 w-full rounded-2xl border border-black/15 bg-white px-4 text-sm outline-none transition focus:border-[#004225] focus:ring-2 focus:ring-[#004225]/10"
          />
        </label>
      </FilterSectionShell>

      {propertyTypes.length > 0 && (
        <PropertyTypeSection
          title="Boendetyp"
          items={propertyTypes}
          selectedId={state.propertyType}
          onSelect={handlePropertyType}
        />
      )}

      {hostTypes.length > 0 && (
        <PropertyTypeSection
          title="Hyresvärd"
          description="Välj om annonsen ska komma från företag eller privat värd."
          items={hostTypes}
          selectedId={state.hostType}
          onSelect={handleHostType}
        />
      )}

      {showPriceFilter && (
        <PriceRangeSection
          title="Prisintervall"
          description="Månadshyra i SEK."
          histogram={priceHistogram}
          bounds={priceBounds}
          value={[state.priceRange.min, state.priceRange.max]}
          onChange={(range) => handlePriceRangeChange(range)}
        />
      )}

      {amenities.length > 0 && (
        <AmenityGridSection
          title="Bekvämligheter"
          description="Alla valda bekvämligheter skickas som upprepade amenities-parametrar."
          items={amenities}
          selectedIds={state.amenities}
          onToggle={handleAmenityToggle}
        />
      )}

      <FilterSectionShell
        title="Nära skola"
        description="Välj en skola eller ange en egen referenspunkt. Båda koordinaterna krävs för API-filtret."
        withBorder={false}
      >
        <div className="space-y-3">
          {schools.length > 0 && (
            <label className="space-y-2">
              <span className="block text-sm font-medium text-black/75">
                Skola
              </span>
              <select
                value={state.schoolId?.toString() ?? ""}
                onChange={(event) => handleSchoolSelect(event.target.value)}
                className="h-11 w-full rounded-2xl border border-black/15 bg-white px-4 text-sm outline-none transition focus:border-[#004225] focus:ring-2 focus:ring-[#004225]/10"
              >
                <option value="">Ingen skola vald</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                    {school.city ? `, ${school.city}` : ""}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-sm font-medium text-black/75">
                Latitud
              </span>
              <input
                type="number"
                step="0.000001"
                value={state.schoolLat ?? ""}
                onChange={(event) =>
                  handleSchoolCoordinateChange("schoolLat", event.target.value)
                }
                placeholder="58.4108"
                className="h-11 w-full rounded-2xl border border-black/15 bg-white px-4 text-sm outline-none transition focus:border-[#004225] focus:ring-2 focus:ring-[#004225]/10"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-medium text-black/75">
                Longitud
              </span>
              <input
                type="number"
                step="0.000001"
                value={state.schoolLng ?? ""}
                onChange={(event) =>
                  handleSchoolCoordinateChange("schoolLng", event.target.value)
                }
                placeholder="15.6214"
                className="h-11 w-full rounded-2xl border border-black/15 bg-white px-4 text-sm outline-none transition focus:border-[#004225] focus:ring-2 focus:ring-[#004225]/10"
              />
            </label>
          </div>
        </div>
      </FilterSectionShell>
    </>
  );

  return (
    <FilterButton
      {...buttonProps}
      onClear={() => {
        updateState(emptyState(priceBounds));
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
