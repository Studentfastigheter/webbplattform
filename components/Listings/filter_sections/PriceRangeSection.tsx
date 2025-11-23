"use client";

import React, { useEffect, useMemo, useState } from "react";
import ControlledRange from "@/components/ui/sliders/Controlled_Range";
import FilterSectionShell from "./FilterSectionShell";

type PriceRange = [number, number];

type PriceRangeSectionProps = {
  title?: string;
  description?: string;
  histogram?: number[];
  bounds: { min: number; max: number };
  value: PriceRange;
  onChange: (range: PriceRange) => void;
  withBorder?: boolean;
};

const PriceRangeSection: React.FC<PriceRangeSectionProps> = ({
  title = "Prisintervall",
  description,
  histogram = [],
  bounds,
  value,
  onChange,
  withBorder = false,
}) => {
  const [inputValues, setInputValues] = useState<[string, string]>([
    value[0].toString(),
    value[1].toString(),
  ]);
  const [errors, setErrors] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  useEffect(() => {
    setInputValues([value[0].toString(), value[1].toString()]);
    setErrors([null, null]);
  }, [value]);

  const formatCurrency = (val: number) =>
    `kr${val.toLocaleString("sv-SE")}`;

  const clampToBounds = (val: number) =>
    Math.min(Math.max(val, bounds.min), bounds.max);

  const parseNumeric = (raw: string) => {
    const cleaned = raw.replace(/[^\d]/g, "");
    return cleaned === "" ? NaN : parseInt(cleaned, 10);
  };

  const validateInput = (index: 0 | 1, raw: string): string | null => {
    const parsed = parseNumeric(raw);
    if (Number.isNaN(parsed)) return "Ange ett värde";

    if (parsed < bounds.min) {
      return `Lägsta tillåtna är ${formatCurrency(bounds.min)}`;
    }
    if (parsed > bounds.max) {
      return `Högsta tillåtna är ${formatCurrency(bounds.max)}`;
    }

    const otherRaw = inputValues[index === 0 ? 1 : 0];
    const otherParsed = parseNumeric(otherRaw);
    const fallbackOther =
      Number.isNaN(otherParsed) ? value[index === 0 ? 1 : 0] : otherParsed;

    if (index === 0 && parsed > fallbackOther) {
      return "Måste vara lägre än eller lika med högsta värdet";
    }
    if (index === 1 && parsed < fallbackOther) {
      return "Måste vara högre än eller lika med lägsta värdet";
    }

    return null;
  };

  const handleManualChange = (index: 0 | 1, raw: string) => {
    setInputValues((prev) => {
      const next = [...prev] as [string, string];
      next[index] = raw;
      return next;
    });

    const message = validateInput(index, raw);
    setErrors((prev) => {
      const next = [...prev] as [string | null, string | null];
      next[index] = message;
      return next;
    });

    if (message) return;

    const parsed = parseNumeric(raw);
    const otherParsed = parseNumeric(inputValues[index === 0 ? 1 : 0]);
    const otherValue = Number.isNaN(otherParsed)
      ? value[index === 0 ? 1 : 0]
      : clampToBounds(otherParsed);

    const draft: PriceRange =
      index === 0 ? [parsed, otherValue] : [otherValue, parsed];

    const nextRange: PriceRange = [
      clampToBounds(Math.min(draft[0], draft[1])),
      clampToBounds(Math.max(draft[0], draft[1])),
    ];

    onChange(nextRange);
  };

  const normalizedHistogram = useMemo(() => {
    const peak = Math.max(...histogram, 0);
    if (!peak) return histogram.map(() => 0);
    return histogram.map((val) => Math.round((val / peak) * 100));
  }, [histogram]);

  return (
    <FilterSectionShell
      title={title}
      description={description}
      withBorder={withBorder}
    >
      <div className="space-y-4">
        <div className="relative rounded-2xl bg-pink-50 px-4 pt-6 pb-12">
          <div className="flex h-32 items-end gap-[2px] overflow-hidden">
            {normalizedHistogram.length > 0 ? (
              normalizedHistogram.map((height, idx) => (
                <span
                  key={idx}
                  className="flex-1 rounded-full bg-[#FF2A6D]"
                  style={{ height: `${Math.max(height, 8)}%` }}
                />
              ))
            ) : (
              <p className="text-sm text-black/50">
                Prisdata hamtas automatiskt nar statistik finns.
              </p>
            )}
          </div>
          <div className="absolute inset-x-4 bottom-3">
            <ControlledRange
              min={bounds.min}
              max={bounds.max}
              value={value}
              onChange={(next) => {
                if (Array.isArray(next)) {
                  onChange([next[0], next[1]]);
                }
              }}
              showValue={false}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1 text-sm text-black/70">
          <div className="space-y-1">
            <span className="block text-xs uppercase text-black/60">
              Lägst
            </span>
            <div className="flex items-center gap-2 rounded-full border border-black/15 px-3 py-2 shadow-sm">
              <span className="text-sm text-black/60">kr</span>
              <input
                type="text"
                inputMode="numeric"
                min={bounds.min}
                max={bounds.max}
                value={inputValues[0]}
                onChange={(e) => handleManualChange(0, e.target.value)}
                className="w-full bg-transparent text-base font-semibold outline-none"
                aria-label="Lägsta pris"
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-black/50">
                Min: {formatCurrency(bounds.min)}
              </span>
              {errors[0] && (
                <span className="text-red-600">{errors[0]}</span>
              )}
            </div>
          </div>
          <div className="space-y-1 text-right">
            <span className="block text-xs uppercase text-black/60">
              Högst
            </span>
            <div className="flex items-center gap-2 rounded-full border border-black/15 px-3 py-2 shadow-sm">
              <span className="text-sm text-black/60">kr</span>
              <input
                type="text"
                inputMode="numeric"
                min={bounds.min}
                max={bounds.max}
                value={inputValues[1]}
                onChange={(e) => handleManualChange(1, e.target.value)}
                className="w-full bg-transparent text-base font-semibold text-right outline-none"
                aria-label="Högsta pris"
              />
            </div>
            <div className="flex justify-between text-xs">
              {errors[1] && (
                <span className="text-red-600">{errors[1]}</span>
              )}
              <span className="text-black/50">
                Max: {formatCurrency(bounds.max)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </FilterSectionShell>
  );
};

export default PriceRangeSection;
