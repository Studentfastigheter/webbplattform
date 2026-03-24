"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";

type OptionProps = {
  value: string;
  label: string;
  ariaLabel?: string;
};

type TogglesProps = {
  options: OptionProps[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

export default function Toggles({
  options,
  defaultValue,
  value: controlledValue,
  onValueChange,
}: TogglesProps) {
  const [internalValue, setInternalValue] = useState(
    defaultValue || options[0]?.value || ""
  );

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (newValue: string) => {
    if (!newValue) return;

    if (!isControlled) {
      setInternalValue(newValue);
    }

    onValueChange?.(newValue);
  };

  return (
    <ToggleGroup
      type="single"
      size="sm"
      value={value}
      onValueChange={handleChange}
      variant="outline"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.ariaLabel || option.label}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}