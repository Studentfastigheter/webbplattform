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

  const formatCurrency = (val: number) => `kr${val.toLocaleString("sv-SE")}`;

  const formatInterval = (min?: number | null, max?: number | null) => {
    if (typeof min === "number" && typeof max === "number") {
      return `${formatCurrency(min)}-${formatCurrency(max)}`;
    }
    if (typeof min === "number") return `Fr\u00e5n ${formatCurrency(min)}`;
    if (typeof max === "number") return `Till ${formatCurrency(max)}`;
    return "Prisintervall";
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

  const histogramTotal = useMemo(
    () => histogramBuckets.reduce((sum, bucket) => sum + bucket.count, 0),
    [histogramBuckets]
  );

  useEffect(() => {
    setInputValues([displayValue[0].toString(), displayValue[1].toString()]);
    setErrors([null, null]);
  }, [displayValue]);

  const validateInput = (index: 0 | 1, raw: string): string | null => {
    const parsed = parseNumeric(raw);
    if (Number.isNaN(parsed)) return "Ange ett v\u00e4rde";

    if (parsed < histogramScale.min) {
      return `L\u00e4gsta till\u00e5tna \u00e4r ${formatCurrency(histogramScale.min)}`;
    }
    if (parsed > histogramScale.max) {
      return `H\u00f6gsta till\u00e5tna \u00e4r ${formatCurrency(histogramScale.max)}`;
    }

    const otherRaw = inputValues[index === 0 ? 1 : 0];
    const otherParsed = parseNumeric(otherRaw);
    const fallbackOther =
      Number.isNaN(otherParsed) ? displayValue[index === 0 ? 1 : 0] : otherParsed;

    if (index === 0 && parsed > fallbackOther) {
      return "M\u00e5ste vara l\u00e4gre \u00e4n eller lika med h\u00f6gsta v\u00e4rdet";
    }
    if (index === 1 && parsed < fallbackOther) {
      return "M\u00e5ste vara h\u00f6gre \u00e4n eller lika med l\u00e4gsta v\u00e4rdet";
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
      <div className="space-y-4">
        <div className="relative rounded-2xl bg-pink-50 px-4 pb-12 pt-6">
          <div className="flex h-32 items-end gap-[2px] overflow-hidden">
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
                  className={`flex-1 rounded-full transition-[height,background-color,opacity] duration-200 ${
                    bucket.count > 0
                      ? bucket.overlapsSelectedRange
                        ? "bg-[#FF2A6D]"
                        : "bg-[#FF2A6D]/30"
                      : "bg-black/10"
                  }`}
                  style={{
                    height: `${
                      bucket.count > 0 ? Math.max(bucket.height, 8) : 3
                    }%`,
                  }}
                />
              ))
            ) : (
              <p className="text-sm text-black/50">
                Prisdata h\u00e4mtas automatiskt n\u00e4r statistik finns.
              </p>
            )}
          </div>
          {histogramBuckets.length > 0 && (
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-black/55">
              <span>
                {histogramTotal.toLocaleString("sv-SE")} annonser i intervallen
              </span>
              <span>{histogramBuckets.length} prisniv\u00e5er</span>
            </div>
          )}
          <div className="absolute inset-x-4 bottom-3">
            <ControlledRange
              ariaLabel="Prisintervall"
              min={histogramScale.min}
              max={histogramScale.max}
              step={sliderStep}
              value={displayValue}
              onChange={handleSliderChange}
              showValue={false}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1 text-sm text-black/70">
          <div className="space-y-1">
            <span className="block text-xs uppercase text-black/60">
              L\u00e4gst
            </span>
            <div className="flex items-center gap-2 rounded-full border border-black/15 px-3 py-2 shadow-sm">
              <span className="text-sm text-black/60">kr</span>
              <input
                type="text"
                inputMode="numeric"
                min={histogramScale.min}
                max={histogramScale.max}
                value={inputValues[0]}
                onChange={(e) => handleManualChange(0, e.target.value)}
                className="w-full bg-transparent text-base font-semibold outline-none"
                aria-label="L\u00e4gsta pris"
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-black/50">
                Min: {formatCurrency(histogramScale.min)}
              </span>
              {errors[0] && <span className="text-red-600">{errors[0]}</span>}
            </div>
          </div>
          <div className="space-y-1 text-right">
            <span className="block text-xs uppercase text-black/60">
              H\u00f6gst
            </span>
            <div className="flex items-center gap-2 rounded-full border border-black/15 px-3 py-2 shadow-sm">
              <span className="text-sm text-black/60">kr</span>
              <input
                type="text"
                inputMode="numeric"
                min={histogramScale.min}
                max={histogramScale.max}
                value={inputValues[1]}
                onChange={(e) => handleManualChange(1, e.target.value)}
                className="w-full bg-transparent text-right text-base font-semibold outline-none"
                aria-label="H\u00f6gsta pris"
              />
            </div>
            <div className="flex justify-between text-xs">
              {errors[1] && <span className="text-red-600">{errors[1]}</span>}
              <span className="text-black/50">
                Max: {formatCurrency(histogramScale.max)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </FilterSectionShell>
  );
};

export default PriceRangeSection;
