"use client";

import React, { type ReactNode } from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

type RangeValue = [number, number];

type ControlledRangeProps = {
  label?: string;
  ariaLabel?: string;
  min?: number;
  max?: number;
  step?: number;
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  formatValue?: (value: RangeValue) => string;
  valueRenderer?: (value: RangeValue) => ReactNode;
  showValue?: boolean;
  className?: string;
  isDisabled?: boolean;
  isVertical?: boolean;
};

const ControlledRange: React.FC<ControlledRangeProps> = ({
  label,
  ariaLabel,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  formatValue,
  valueRenderer,
  showValue = true,
  className = "",
  isDisabled = false,
  isVertical = false,
}) => {
  const display = formatValue ? formatValue(value) : `${value[0]} - ${value[1]}`;
  const renderedValue = valueRenderer ? valueRenderer(value) : display;
  const shouldShowValue = showValue && renderedValue;
  const rangeLabel = ariaLabel ?? label ?? "Intervall";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {(label || shouldShowValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-foreground">
              {label}
            </label>
          )}
          {shouldShowValue && (
            <div className="text-sm text-gray-500">{renderedValue}</div>
          )}
        </div>
      )}

      <SliderPrimitive.Root
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={isDisabled}
        orientation={isVertical ? "vertical" : "horizontal"}
        onValueChange={(val) => {
          if (Array.isArray(val) && val.length === 2) {
            onChange([val[0], val[1]]);
          }
        }}
        className={cn(
          "relative flex touch-none select-none items-center data-[disabled]:opacity-50",
          isVertical ? "h-40 w-max flex-col justify-center px-3" : "w-full max-w-full py-3"
        )}
      >
        <SliderPrimitive.Track
          className={cn(
            "relative grow overflow-hidden rounded-full bg-gray-200",
            isVertical ? "h-full w-1.5" : "h-1.5 w-full"
          )}
        >
          <SliderPrimitive.Range
            className={cn("absolute bg-black", isVertical ? "w-full" : "h-full")}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label={`${rangeLabel} – lägsta`}
          className="block h-5 w-5 rounded-full border border-black bg-white shadow-sm transition-shadow data-[state=active]:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        />
        <SliderPrimitive.Thumb
          aria-label={`${rangeLabel} – högsta`}
          className="block h-5 w-5 rounded-full border border-black bg-white shadow-sm transition-shadow data-[state=active]:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        />
      </SliderPrimitive.Root>
    </div>
  );
};

export default ControlledRange;
