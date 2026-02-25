"use client";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useState } from "react";


type OptionProps = {
  value: string,
  label: string,
  ariaLabel?: string,
}


export default function Toggles({
  options,
  defaultValue,
}: {
  options: OptionProps[],
  defaultValue?: string,
}) {
  const [value, setValue] = useState(defaultValue || options[0]?.value || "")

  return (
    <ToggleGroup 
      type="single" 
      size="sm" 
      value={value}
      onValueChange={(v) => {
        if (v) setValue(v)
      }}
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
  )
}
