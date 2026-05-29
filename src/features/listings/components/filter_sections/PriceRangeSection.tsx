"use client";

import React, { useEffect, useMemo, useState } from "react";
import ControlledRange from "@/components/ui/sliders/Controlled_Range";
import FilterSectionShell from "./FilterSectionShell";

type PriceRange = [number, number];

export type PriceHistogramBucket = {
  minRent?: number | null;
  maxRent?: number | null;
  count?: number | null;
};

export type PriceHistogramValue = number | PriceHistogramBucket;

type PriceBounds = {
  min: number;
  max: number;
};

type PriceRangeSectionProps = {
  title?: string;
  description?: string;
  histogram?: PriceHistogramValue[];
  bounds: PriceBounds;
  value: PriceRange;
  onChange: (range: PriceRange) => void;
  withBorder?: boolean;
};

const PriceRangeSection: React.FC<PriceRangeSectionProps> = ({
  title,
  description,
  histogram = [],
  bounds,
  value,
  onChange,
  withBorder = true,
}) => {
  const [inputValues, setInputValues] = useState<[string, string]>([
    value[0].toString(),
    value[1].toString(),
  ]);
  const [errors, setErrors] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  const formatCurrency = (val: number) =>
    `${val.toLocaleString("sv-SE")} kr`;

  const formatInterval = (min?: number | null, max?: number | null) => {
    if (typeof min === "number" && typeof max === "number") {
      return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    }
    if (typeof min === "number") return `Från ${formatCurrency(min)}`;
    if (typeof max === "number") return `Till ${formatCurrency(max)}`;
    return "Hyra";
  };

  const clampToBounds = (val: number, targetBounds: PriceBounds) =>
    Math.min(Math.max(val, targetBounds.min), targetBounds.max);

  const parseNumeric = (raw: string) => {
    const cleaned = raw.replace(/[^\d]/g, "");
    return cleaned === "" ? NaN : parseInt(cleaned, 10);
  };

  const histogramBuckets = useMemo(() => {
    const buckets = histogram.map((bucket, index) => {
      if (typeof bucket === "number") {
        return {
          key: `bucket-${index}`,
          minRent: null,
          maxRent: null,
          count: Math.max(0, bucket),
          label: `Intervall ${index + 1}`,
        };
      }

      const minRent =
        typeof bucket.minRent === "number" && Number.isFinite(bucket.minRent)
          ? bucket.minRent
          : null;
      const maxRent =
        typeof bucket.maxRent === "number" && Number.isFinite(bucket.maxRent)
          ? bucket.maxRent
          : null;
      const count =
        typeof bucket.count === "number" && Number.isFinite(bucket.count)
          ? Math.max(0, bucket.count)
          : 0;

      return {
        key: `${minRent ?? "min"}-${maxRent ?? "max"}-${index}`,
        minRent,
        maxRent,
        count,
        label: formatInterval(minRent, maxRent),
      };
    });

    const peak = Math.max(...buckets.map((bucket) => bucket.count), 0);

    return buckets.map((bucket) => {
      const overlapsSelectedRange =
        bucket.minRent === null ||
        bucket.maxRent === null ||
        (bucket.maxRent >= value[0] && bucket.minRent <= value[1]);

      return {
        ...bucket,
        height: peak > 0 ? Math.round((bucket.count / peak) * 100) : 0,
        overlapsSelectedRange,
      };
    });
  }, [histogram, value]);

  const histogramScale = useMemo<PriceBounds>(() => {
    const first = histogramBuckets[0];
    const last = histogramBuckets[histogramBuckets.length - 1];

    if (
      first?.minRent !== null &&
      first?.minRent !== undefined &&
      last?.maxRent !== null &&
      last?.maxRent !== undefined &&
      last.maxRent > first.minRent
    ) {
      return {
        min: Math.floor(first.minRent),
        max: Math.ceil(last.maxRent),
      };
    }

    return bounds;
  }, [bounds, histogramBuckets]);

  const displayValue = useMemo<PriceRange>(() => {
    const isFullDefaultRange =
      value[0] === bounds.min && value[1] === bounds.max;

    if (isFullDefaultRange) {
      return [histogramScale.min, histogramScale.max];
    }

    return [
      clampToBounds(Math.min(value[0], value[1]), histogramScale),
      clampToBounds(Math.max(value[0], value[1]), histogramScale),
    ];
  }, [
    bounds.max,
    bounds.min,
    histogramScale.max,
    histogramScale.min,
    value,
  ]);

  const sliderStep = useMemo(() => {
    const first = histogramBuckets[0];
    if (!first || first.minRent === null || first.maxRent === null) return 100;

    const width = first.maxRent - first.minRent;
    if (!Number.isFinite(width) || width <= 0) return 100;

    return Math.max(1, Math.round(width));
  }, [histogramBuckets]);

  useEffect(() => {
    setInputValues([displayValue[0].toString(), displayValue[1].toString()]);
    setErrors([null, null]);
  }, [displayValue]);

  const validateInput = (index: 0 | 1, raw: string): string | null => {
    const parsed = parseNumeric(raw);
    if (Number.isNaN(parsed)) return "Ange ett värde";

    if (parsed < histogramScale.min) {
      return `Lägsta tillåtna är ${formatCurrency(histogramScale.min)}`;
    }
    if (parsed > histogramScale.max) {
      return `Högsta tillåtna är ${formatCurrency(histogramScale.max)}`;
    }

    const otherRaw = inputValues[index === 0 ? 1 : 0];
    const otherParsed = parseNumeric(otherRaw);
    const fallbackOther =
      Number.isNaN(otherParsed) ? displayValue[index === 0 ? 1 : 0] : otherParsed;

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
      ? displayValue[index === 0 ? 1 : 0]
      : clampToBounds(otherParsed, histogramScale);

    const draft: PriceRange =
      index === 0 ? [parsed, otherValue] : [otherValue, parsed];

    onChange([
      clampToBounds(Math.min(draft[0], draft[1]), histogramScale),
      clampToBounds(Math.max(draft[0], draft[1]), histogramScale),
    ]);
  };

  const handleSliderChange = (next: PriceRange) => {
    onChange([
      clampToBounds(Math.min(next[0], next[1]), histogramScale),
      clampToBounds(Math.max(next[0], next[1]), histogramScale),
    ]);
  };

  return (
    <FilterSectionShell
      title={title}
      description={description}
      withBorder={withBorder}
    >
      <div className="space-y-3">
        <div className="relative px-1 pb-10 pt-1">
          <div className="flex h-24 items-end gap-[3px] overflow-hidden sm:h-28">
              {histogramBuckets.length > 0 ? (
                histogramBuckets.map((bucket) => (
                  <span
                    key={bucket.key}
                    role="img"
                    aria-label={`${bucket.label}: ${bucket.count.toLocaleString(
                      "sv-SE"
                    )} annonser`}
                    title={`${bucket.label}: ${bucket.count.toLocaleString(
                      "sv-SE"
                    )} annonser`}
                    className={`flex-1 rounded-t-sm transition-[height,background-color,opacity] duration-200 ${
                      bucket.count > 0
                        ? bucket.overlapsSelectedRange
                          ? "bg-[#004225]"
                          : "bg-[#004225]/20"
                        : "bg-black/[0.08]"
                    }`}
                    style={{
                      height: `${
                        bucket.count > 0 ? Math.max(bucket.height, 8) : 3
                      }%`,
                    }}
                  />
                ))
              ) : (
                <p className="flex h-full w-full items-center justify-center text-center text-sm text-black/50">
                  Prisdata hämtas automatiskt när statistik finns.
                </p>
              )}
          </div>

          <div className="absolute inset-x-1 bottom-1">
            <ControlledRange
              ariaLabel="Månadshyra"
              min={histogramScale.min}
              max={histogramScale.max}
              step={sliderStep}
              value={displayValue}
              onChange={handleSliderChange}
              showValue={false}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm text-black/70 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="block text-xs font-semibold uppercase tracking-wide text-black/55">
              Från
            </span>
            <div className="flex items-center gap-2 rounded-lg border border-black/15 bg-white px-3 py-2 shadow-sm transition focus-within:border-[#004225] focus-within:ring-2 focus-within:ring-[#004225]/10">
              <input
                type="text"
                inputMode="numeric"
                min={histogramScale.min}
                max={histogramScale.max}
                value={inputValues[0]}
                onChange={(e) => handleManualChange(0, e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-right text-base font-semibold outline-none"
                aria-label="Lägsta pris"
              />
              <span className="text-sm text-black/50">kr</span>
            </div>
            {errors[0] && (
              <p className="text-xs text-red-600">{errors[0]}</p>
            )}
          </label>
          <label className="space-y-1.5 sm:text-right">
            <span className="block text-xs font-semibold uppercase tracking-wide text-black/55">
              Till
            </span>
            <div className="flex items-center gap-2 rounded-lg border border-black/15 bg-white px-3 py-2 shadow-sm transition focus-within:border-[#004225] focus-within:ring-2 focus-within:ring-[#004225]/10">
              <input
                type="text"
                inputMode="numeric"
                min={histogramScale.min}
                max={histogramScale.max}
                value={inputValues[1]}
                onChange={(e) => handleManualChange(1, e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-right text-base font-semibold outline-none"
                aria-label="Högsta pris"
              />
              <span className="text-sm text-black/50">kr</span>
            </div>
            {errors[1] && (
              <p className="text-xs text-red-600">{errors[1]}</p>
            )}
          </label>
        </div>
      </div>
    </FilterSectionShell>
  );
};

export default PriceRangeSection;
