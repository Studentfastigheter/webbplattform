"use client";

import React, { type ReactNode } from "react";
import { Slider } from "@heroui/react";

type RangeValue = [number, number];

type ControlledRangeProps = {
  label?: string;
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

      <Slider
        minValue={min}
        maxValue={max}
        step={step}
        value={value} // always an array for range slider
        onChange={(val) => {
          if (Array.isArray(val) && val.length === 2) {
            onChange([val[0], val[1]]);
          }
        }}
        isDisabled={isDisabled}
        orientation={isVertical ? "vertical" : "horizontal"}
        className="max-w-full"
        classNames={{
          base: "max-w-full",
          trackWrapper: isVertical ? "h-40" : "py-3",
          track: "h-1.5 rounded-full bg-gray-200",
          filler: "bg-black",
          thumb:
            "h-5 w-5 rounded-full border border-black bg-white shadow-sm data-[dragging=true]:shadow-md",
        }}
      />
    </div>
  );
};

export default ControlledRange;
