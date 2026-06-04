"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import ChipCloudSection from "@/features/listings/components/filter_sections/ChipCloudSection";
import StatusCardSection from "@/features/listings/components/filter_sections/StatusCardSection";
import FilterButton, { type FilterButtonProps } from "./filterbutton";
import { useI18n } from "@/i18n/I18nProvider";

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
  citySelectionMode?: "multiple" | "single";
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
  citySelectionMode = "multiple",
  landlords = [],
  landlordCounts,
  statuses,
  initialState = defaultState,
  onApply,
  onClear,
  onChange,
  emptyState,
  ...buttonProps
}) => {
  const { t } = useI18n();
  const defaultStatuses = useMemo(
    () => [
      {
        id: "open",
        label: t("filters.queue.statuses.open.label"),
        description: t("filters.queue.statuses.open.description"),
      },
      {
        id: "paused",
        label: t("filters.queue.statuses.paused.label"),
        description: t("filters.queue.statuses.paused.description"),
      },
      {
        id: "closed",
        label: t("filters.queue.statuses.closed.label"),
        description: t("filters.queue.statuses.closed.description"),
      },
      {
        id: "all",
        label: t("filters.queue.statuses.all.label"),
        description: t("filters.queue.statuses.all.description"),
      },
    ],
    [t],
  );
  const resolvedStatuses = statuses ?? defaultStatuses;
  const resolvedInitial = useMemo(() => initialState, [initialState]);
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

    if (key === "cities" && citySelectionMode === "single") {
      updateState({
        ...state,
        cities: current.includes(value) ? [] : [value],
      });
      return;
    }

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
      cities.length > 0 || landlords.length > 0 || resolvedStatuses.length > 0;

    if (!hasAnyData) {
      return (
        emptyState ?? (
          <p className="text-center text-sm text-black/60">
            {t("filters.queue.empty")}
          </p>
        )
      );
    }

    return (
      <>
        {cities.length > 0 && (
          <ChipCloudSection
            title={t("filters.queue.cityTitle")}
            description={t("filters.queue.cityDescription")}
            items={cities.map((city) => ({
              id: city,
              label: city,
              count: cityCounts?.[city],
            }))}
            selectedIds={state.cities}
            onToggle={(id) => toggleValue("cities", id)}
          />
        )}

        {landlords.length > 0 && (
          <ChipCloudSection
            title={t("filters.queue.landlordTitle")}
            description={t("filters.queue.landlordDescription")}
            items={landlords.map((landlord) => ({
              id: landlord,
              label: landlord,
              count: landlordCounts?.[landlord],
            }))}
            selectedIds={state.landlords}
            onToggle={(id) => toggleValue("landlords", id)}
          />
        )}

        {resolvedStatuses.length > 0 && (
          <StatusCardSection
            title={t("filters.queue.statusTitle")}
            description={t("filters.queue.statusDescription")}
            items={resolvedStatuses}
            selectedId={state.status}
            onSelect={(id) => updateState({ ...state, status: id })}
            withBorder={false}
          />
        )}
      </>
    );
  }, [
    cities,
    cityCounts,
    citySelectionMode,
    landlords,
    landlordCounts,
    resolvedStatuses,
    state,
    emptyState,
    t,
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
