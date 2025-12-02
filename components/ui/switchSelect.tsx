"use client";

import React from "react";
import { motion } from "framer-motion";

export type SwitchSelectValue = "lista" | "karta";

type Props = {
  value?: SwitchSelectValue;                    // controlled
  onChange?: (next: SwitchSelectValue) => void; // controlled
  labels?: { lista?: string; karta?: string };
  className?: string;
  disabled?: boolean;
};

export function SwitchSelect({
  value,
  onChange,
  labels = { lista: "Lista", karta: "Karta" },
  className = "",
  disabled = false,
}: Props) {
  // internal state for uncontrolled usage
  const [internal, setInternal] = React.useState<SwitchSelectValue>("lista");

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value! : internal;

  const options = [
    { key: "lista" as const, label: labels.lista ?? "Lista" },
    { key: "karta" as const, label: labels.karta ?? "Karta" },
  ];

  const selectedIndex = currentValue === "karta" ? 1 : 0;

  const setValue = (next: SwitchSelectValue) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div
      role="tablist"
      aria-disabled={disabled}
      className={[
        "relative inline-grid grid-cols-2 items-center",
        "h-12 w-[120px] sm:w-[160px]",//Ändra storlek
        "rounded-full bg-white",
        "border border-black/10",
        "shadow-[0_7px_18px_rgba(0,0,0,0.12)]",
        disabled ? "opacity-60 pointer-events-none" : "",
        className,
      ].join(" ")}
    >
      {/* sliding highlight */}
      <motion.div
        aria-hidden
        className={[
          // fyll hela höjden och halva bredden
          "absolute top-0 bottom-0 left-0 w-1/2",
          "rounded-full bg-[#E9E9E9]",
          "shadow-[0_6px_14px_rgba(0,0,0,0.22)]",
        ].join(" ")}
        animate={{ x: `${selectedIndex * 100}%` }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
      />



      {options.map((opt) => {
        const active = opt.key === currentValue;
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setValue(opt.key)}
            className={[
              "relative z-10 h-full w-full rounded-full",
              "text-sm font-medium tracking-tight",
              "transition-colors duration-200",
              active ? "text-black" : "text-black/80",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default SwitchSelect;
