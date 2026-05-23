"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import AmenityGridSection from "@/components/Listings/filter_sections/AmenityGridSection";
import FilterSectionShell from "@/components/Listings/filter_sections/FilterSectionShell";
import PriceRangeSection, {
  type PriceHistogramValue,
} from "@/components/Listings/filter_sections/PriceRangeSection";
import PropertyTypeSection from "@/components/Listings/filter_sections/PropertyTypeSection";
import FilterButton, {
  type FilterButtonProps,
} from "./filterbutton";

type PriceBounds = {
  min: number;
  max: number;
};

type SchoolOption = {
  id: number | string;
  name: string;
  city?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
};

type SelectableSchoolOption = SchoolOption & {
  key: string;
  normalizedId: number;
  label: string;
  parsedLat: number;
  parsedLng: number;
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
  "children" | "onApply" | "onClear" | "resultsLabel" | "resultsMeta" | "resultsLoading"
> & {
  amenities?: { id: string; label: string; icon?: ReactNode }[];
  propertyTypes?: { id: string; label: string }[];
  hostTypes?: { id: string; label: string }[];
  schools?: SchoolOption[];
  priceHistogram?: PriceHistogramValue[];
  facetTotalCount?: number | null;
  facetsLoading?: boolean;
  facetsError?: string | null;
  propertyTypeCounts?: Record<string, number>;
  hostTypeCounts?: Record<string, number>;
  observedRentRange?: PriceBounds | null;
  priceBounds?: PriceBounds;
  showPriceFilter?: boolean;
  initialState?: ListingsFilterState;
  onApply?: (state: ListingsFilterState) => void;
  onClear?: () => void;
  onChange?: (state: ListingsFilterState) => void;
};

const defaultBounds: PriceBounds = { min: 0, max: 10000 };

const formatListingCount = (count: number) =>
  `${count.toLocaleString("sv-SE")} ${count === 1 ? "bostad" : "bost\u00e4der"}`;

const formatRent = (value: number) =>
  `${value.toLocaleString("sv-SE")} kr`;

const hasCustomPriceRange = (range: PriceBounds, bounds: PriceBounds) =>
  range.min > bounds.min || range.max < bounds.max;

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

const formatSchoolLabel = (school: SchoolOption) =>
  [school.name, school.city].filter(Boolean).join(", ");

const parseCoordinate = (value: number | string | null | undefined) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const parsed = Number(value.trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

const getSchoolKeyValue = (value: unknown) => {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (value == null) return "";

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const parseSchoolId = (value: SchoolOption["id"]) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const getSelectableSchools = (schools: SchoolOption[]) => {
  const schoolsById = new Map<number, SelectableSchoolOption>();

  schools.forEach((school) => {
    const normalizedId = parseSchoolId(school.id);
    const parsedLat = parseCoordinate(school.lat);
    const parsedLng = parseCoordinate(school.lng);

    if (
      normalizedId === null ||
      parsedLat === null ||
      parsedLng === null ||
      !school.name.trim()
    ) {
      return;
    }

    if (schoolsById.has(normalizedId)) {
      return;
    }

    schoolsById.set(normalizedId, {
      ...school,
      key: getSchoolKeyValue(normalizedId),
      normalizedId,
      label: formatSchoolLabel(school),
      parsedLat,
      parsedLng,
    });
  });

  return Array.from(schoolsById.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "sv", { sensitivity: "base" })
  );
};

const ListingsFilterButton: React.FC<ListingsFilterButtonProps> = ({
  amenities = [],
  propertyTypes = [],
  hostTypes = [],
  schools = [],
  priceHistogram = [],
  facetTotalCount = null,
  facetsLoading = false,
  facetsError = null,
  propertyTypeCounts,
  hostTypeCounts,
  observedRentRange,
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
  const [schoolSearch, setSchoolSearch] = useState("");
  const [isSchoolListOpen, setIsSchoolListOpen] = useState(false);
  const selectableSchools = useMemo(
    () => getSelectableSchools(schools),
    [schools]
  );

  useEffect(() => {
    setState(resolvedInitial);
    const initialSchool = selectableSchools.find(
      (school) => school.normalizedId === resolvedInitial.schoolId
    );
    setSchoolSearch(initialSchool?.label ?? "");
  }, [resolvedInitial, selectableSchools]);

  const filteredSchools = useMemo(() => {
    const query = schoolSearch.trim().toLowerCase();
    if (!query) return selectableSchools.slice(0, 20);

    return selectableSchools
      .filter((school) => school.label.toLowerCase().includes(query))
      .slice(0, 20);
  }, [schoolSearch, selectableSchools]);

  const resultsLabel = useMemo(() => {
    if (typeof facetTotalCount !== "number" && facetsLoading) {
      return "H\u00e4mtar tr\u00e4ffar...";
    }
    if (typeof facetTotalCount === "number") {
      return `Visa ${formatListingCount(facetTotalCount)}`;
    }
    return undefined;
  }, [facetTotalCount, facetsLoading]);

  const resultsMeta = useMemo(() => {
    if (facetsLoading && typeof facetTotalCount === "number") {
      return "Uppdaterar tr\u00e4ffar...";
    }
    if (facetsError) return facetsError;
    return null;
  }, [facetTotalCount, facetsError, facetsLoading]);

  const priceDescription = useMemo(() => {
    const base = "M\u00e5nadshyra i SEK.";
    if (
      observedRentRange &&
      Number.isFinite(observedRentRange.min) &&
      Number.isFinite(observedRentRange.max)
    ) {
      return `${base} Matchande bost\u00e4der ligger mellan ${formatRent(
        observedRentRange.min
      )} och ${formatRent(observedRentRange.max)}.`;
    }

    return base;
  }, [observedRentRange]);

  const selectedSummary = useMemo(() => {
    const items: string[] = [];
    const propertyType = propertyTypes.find((item) => item.id === state.propertyType);
    const hostType = hostTypes.find((item) => item.id === state.hostType);
    const selectedSchool = selectableSchools.find(
      (school) => school.normalizedId === state.schoolId
    );

    if (state.city.trim()) items.push(state.city.trim());
    if (propertyType) items.push(propertyType.label);
    if (hostType) items.push(hostType.label);
    if (hasCustomPriceRange(state.priceRange, priceBounds)) {
      items.push(`${formatRent(state.priceRange.min)}-${formatRent(state.priceRange.max)}`);
    }
    if (selectedSchool) items.push(selectedSchool.name);
    if (state.amenities.length > 0) {
      items.push(`${state.amenities.length} bekv\u00e4mligheter`);
    }

    return items;
  }, [
    hostTypes,
    priceBounds,
    propertyTypes,
    selectableSchools,
    state.amenities.length,
    state.city,
    state.hostType,
    state.priceRange,
    state.propertyType,
    state.schoolId,
  ]);

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

  const clearSchool = () => {
    setSchoolSearch("");
    setIsSchoolListOpen(false);
    updateState({
      ...state,
      schoolId: null,
      schoolLat: null,
      schoolLng: null,
    });
  };

  const handleSchoolSelect = (school: SelectableSchoolOption) => {
    if (state.schoolId === school.normalizedId) {
      clearSchool();
      return;
    }

    setSchoolSearch(school.label);
    setIsSchoolListOpen(false);
    updateState({
      ...state,
      schoolId: school.normalizedId,
      schoolLat: school.parsedLat,
      schoolLng: school.parsedLng,
    });
  };

  const handleSchoolSearchChange = (value: string) => {
    setSchoolSearch(value);
    setIsSchoolListOpen(true);
    const selectedSchool = selectableSchools.find(
      (school) => school.normalizedId === state.schoolId
    );
    const selectedLabel = selectedSchool?.label ?? "";

    if (!value.trim() || (selectedSchool && value !== selectedLabel)) {
      updateState({
        ...state,
        schoolId: null,
        schoolLat: null,
        schoolLng: null,
      });
    }
  };

  const content = (
    <>
      <div
        className={`mb-1 rounded-2xl border px-4 py-3 transition-colors ${
          facetTotalCount === 0
            ? "border-amber-200 bg-amber-50 text-amber-950"
            : "border-[#004225]/15 bg-[#004225]/5 text-[#004225]"
        }`}
        aria-live="polite"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase opacity-70">
              Matchande annonser
            </p>
            <p className="mt-1 text-2xl font-semibold leading-none">
              {typeof facetTotalCount === "number"
                ? facetTotalCount.toLocaleString("sv-SE")
                : facetsLoading
                  ? "..."
                  : "-"}
            </p>
          </div>
          <div className="text-sm sm:max-w-[340px] sm:text-right">
            {typeof facetTotalCount === "number" ? (
              facetTotalCount === 0 ? (
                "Inga annonser matchar kombinationen. Testa att ta bort ett krav eller bredda prisintervallet."
              ) : (
                `${formatListingCount(facetTotalCount)} matchar dina val.`
              )
            ) : facetsError ? (
              facetsError
            ) : facetsLoading ? (
              "H\u00e4mtar tr\u00e4ffar..."
            ) : (
              "Antal tr\u00e4ffar visas n\u00e4r statistik finns."
            )}
            {facetsLoading && typeof facetTotalCount === "number" && (
              <span className="mt-1 block text-xs opacity-70">
                Uppdaterar...
              </span>
            )}
          </div>
        </div>

        {selectedSummary.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedSummary.map((item) => (
              <span
                key={item}
                className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-black/70"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {propertyTypes.length > 0 && (
        <PropertyTypeSection
          title="Boendetyp"
          items={propertyTypes}
          selectedId={state.propertyType}
          onSelect={handlePropertyType}
          counts={propertyTypeCounts}
        />
      )}

      {hostTypes.length > 0 && (
        <PropertyTypeSection
          title={"Hyresv\u00e4rd"}
          description={
            "Antalet visar hur m\u00e5nga annonser som finns kvar med dina andra val."
          }
          items={hostTypes}
          selectedId={state.hostType}
          onSelect={handleHostType}
          counts={hostTypeCounts}
        />
      )}

      {showPriceFilter && (
        <PriceRangeSection
          title="Prisintervall"
          description={priceDescription}
          histogram={priceHistogram}
          bounds={priceBounds}
          value={[state.priceRange.min, state.priceRange.max]}
          onChange={(range) => handlePriceRangeChange(range)}
        />
      )}

      {amenities.length > 0 && (
        <AmenityGridSection
          title={"Bekv\u00e4mligheter"}
          description={
            "Alla valda bekv\u00e4mligheter m\u00e5ste finnas p\u00e5 annonsen."
          }
          items={amenities}
          selectedIds={state.amenities}
          onToggle={handleAmenityToggle}
        />
      )}

      <FilterSectionShell
        title={"N\u00e4ra skola"}
        description={
          "V\u00e4lj ett campus eller en skola f\u00f6r att hitta annonser i n\u00e4rheten."
        }
        withBorder={false}
      >
        <div className="space-y-2">
          <label className="space-y-2">
            <span className="block text-sm font-medium text-black/75">
              Skola
            </span>
            <div className="relative">
              <input
                type="text"
                value={schoolSearch}
                onFocus={() => setIsSchoolListOpen(true)}
                onChange={(event) =>
                  handleSchoolSearchChange(event.target.value)
                }
                placeholder={"S\u00f6k skola eller universitet"}
                className="h-11 w-full rounded-2xl border border-black/15 bg-white px-4 pr-24 text-sm outline-none transition focus:border-[#004225] focus:ring-2 focus:ring-[#004225]/10"
              />
              {state.schoolId && (
                <button
                  type="button"
                  onClick={clearSchool}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-semibold text-[#004225] hover:bg-[#004225]/5"
                >
                  Rensa
                </button>
              )}
            </div>
          </label>

          {schools.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-black/15 px-4 py-3 text-sm text-black/55">
              Skolor laddas...
            </p>
          ) : selectableSchools.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-black/15 px-4 py-3 text-sm text-black/55">
              Inga skolor med position kunde hittas.
            </p>
          ) : (
            <div
              className={`max-h-56 overflow-y-auto rounded-2xl border border-black/10 bg-white p-2 ${
                isSchoolListOpen || !state.schoolId ? "block" : "hidden"
              }`}
            >
              {filteredSchools.length > 0 ? (
                filteredSchools.map((school) => {
                  const isSelected = state.schoolId === school.normalizedId;

                  return (
                    <button
                      key={school.key}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                      onClick={() => handleSchoolSelect(school)}
                      aria-pressed={isSelected}
                      className={`flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2 text-left transition ${
                        isSelected
                          ? "bg-[#004225] text-white"
                          : "text-black hover:bg-[#004225]/5"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-semibold">
                          {school.name}
                        </span>
                        {school.city && (
                          <span
                            className={`block text-xs ${
                              isSelected ? "text-white/75" : "text-black/55"
                            }`}
                          >
                            {school.city}
                          </span>
                        )}
                      </span>
                      {isSelected && (
                        <span className="text-xs font-semibold">
                          Klicka för att ta bort
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="px-3 py-2 text-sm text-black/55">
                  {"Ingen skola matchar din s\u00f6kning."}
                </p>
              )}
            </div>
          )}

          {state.schoolId && (
            <p className="text-xs text-black/55">
              Filtret anv\u00e4nder skolans position n\u00e4r tr\u00e4ffarna r\u00e4knas.
            </p>
          )}
        </div>
      </FilterSectionShell>
    </>
  );

  return (
    <FilterButton
      {...buttonProps}
      resultsLabel={resultsLabel}
      resultsMeta={resultsMeta}
      resultsLoading={facetsLoading}
      onClear={() => {
        updateState(emptyState(priceBounds));
        setSchoolSearch("");
        setIsSchoolListOpen(false);
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
