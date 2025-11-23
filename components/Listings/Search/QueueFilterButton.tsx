"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import ChipCloudSection from "@/components/Listings/filter_sections/ChipCloudSection";
import StatusCardSection from "@/components/Listings/filter_sections/StatusCardSection";
import FilterButton, {
  type FilterButtonProps,
} from "./filterbutton";

export type QueueFilterState = {
  cities: string[];
  landlords: string[];
  status: string | null;
};

type QueueFilterButtonProps = Omit<
  FilterButtonProps,
  "children" | "onApply" | "onClear"
> & {
  cities?: string[];
  cityCounts?: Record<string, number>;
  landlords?: string[];
  landlordCounts?: Record<string, number>;
  statuses?: { id: string; label: string; description?: string }[];
  initialState?: QueueFilterState;
  onApply?: (state: QueueFilterState) => void;
  onClear?: () => void;
  onChange?: (state: QueueFilterState) => void;
  emptyState?: ReactNode;
};

const defaultState: QueueFilterState = {
  cities: [],
  landlords: [],
  status: null,
};

const QueueFilterButton: React.FC<QueueFilterButtonProps> = ({
  cities = [],
  cityCounts,
  landlords = [],
  landlordCounts,
  statuses = [
    {
      id: "open",
      label: "Endast öppna",
      description: "Visar köer där platser finns nu",
    },
    {
      id: "queue",
      label: "Visa köer",
      description: "Inkludera köer med väntetid",
    },
    {
      id: "all",
      label: "Alla",
      description: "Ingen filtrering",
    },
  ],
  initialState = defaultState,
  onApply,
  onClear,
  onChange,
  emptyState,
  ...buttonProps
}) => {
  const resolvedInitial = useMemo(
    () => initialState,
    [initialState]
  );

  const [state, setState] = useState<QueueFilterState>(resolvedInitial);

  useEffect(() => {
    setState(resolvedInitial);
  }, [resolvedInitial]);

  const updateState = (nextState: QueueFilterState) => {
    setState(nextState);
    onChange?.(nextState);
  };

  const toggleValue = (key: keyof QueueFilterState, value: string) => {
    const current = state[key];
    if (!Array.isArray(current)) return;

    const exists = current.includes(value);
    const updated = exists
      ? current.filter((item) => item !== value)
      : [...current, value];

    updateState({
      ...state,
      [key]: updated,
    });
  };

  const content = useMemo<ReactNode>(() => {
    const hasAnyData =
      cities.length > 0 || landlords.length > 0 || statuses.length > 0;

    if (!hasAnyData) {
      return (
        emptyState ?? (
          <p className="text-center text-sm text-black/60">
            Inga filterval tillgängliga just nu.
          </p>
        )
      );
    }

    return (
      <>
        <ChipCloudSection
          title="Var vill du ställa dig i kö?"
          description="Städer hämtas dynamiskt från databasen."
          items={cities.map((city) => ({
            id: city,
            label: city,
            count: cityCounts?.[city],
          }))}
          selectedIds={state.cities}
          onToggle={(id) => toggleValue("cities", id)}
        />

        <ChipCloudSection
          title="Hyresvärd"
          description="Visar vilka köer som hanteras av respektive värd."
          items={landlords.map((landlord) => ({
            id: landlord,
            label: landlord,
            count: landlordCounts?.[landlord],
          }))}
          selectedIds={state.landlords}
          onToggle={(id) => toggleValue("landlords", id)}
        />

        <StatusCardSection
          title="Köläge"
          description="Anpassa om du vill se öppna köer eller alla."
          items={statuses}
          selectedId={state.status}
          onSelect={(id) => updateState({ ...state, status: id })}
          withBorder={false}
        />
      </>
    );
  }, [
    cities,
    cityCounts,
    landlords,
    landlordCounts,
    statuses,
    state,
    emptyState,
  ]);

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

export default QueueFilterButton;
