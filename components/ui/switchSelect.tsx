"use client";

import React from "react";
import { motion } from "framer-motion";
import { List, Map } from "lucide-react";

export type SwitchSelectValue = "lista" | "karta";

type Props = {
  value?: SwitchSelectValue;                    // controlled
  onChange?: (next: SwitchSelectValue) => void; // controlled
  labels?: { lista?: string; karta?: string };
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
};

export function SwitchSelect({
  value,
  onChange,
  labels,
  className = "",
  disabled = false,
  fullWidth = false,
}: Props) {
  // internal state for uncontrolled usage
  const [internal, setInternal] = React.useState<SwitchSelectValue>("lista");

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value! : internal;
  const showLabels = labels !== undefined;
  const resolvedLabels = { lista: labels?.lista ?? "Lista", karta: labels?.karta ?? "Karta" };

  const options = [
    { key: "lista" as const, label: resolvedLabels.lista, icon: <List className="h-4 w-4 sm:h-[18px] sm:w-[18px] xl:h-5 xl:w-5" /> },
    { key: "karta" as const, label: resolvedLabels.karta, icon: <Map className="h-4 w-4 sm:h-[18px] sm:w-[18px] xl:h-5 xl:w-5" /> },
  ];

  const selectedIndex = currentValue === "karta" ? 1 : 0;

  const setValue = (next: SwitchSelectValue) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const widthClass = fullWidth
    ? "w-full"
    : showLabels
      ? "w-[128px] sm:w-[144px] xl:w-[152px]"
      : "w-[72px] sm:w-20 xl:w-24";

  return (
    <div
      role="tablist"
      aria-disabled={disabled}
      className={[
        "relative inline-grid grid-cols-2 items-center",
        "h-8 sm:h-9",
        widthClass,
        "rounded-full bg-white",
        "border border-black/10",
        "shadow-[0_6px_18px_rgba(0,0,0,0.08)]",
        "overflow-hidden",
        disabled ? "opacity-60 pointer-events-none" : "",
        className,
      ].join(" ")}
    >
      {/* sliding highlight */}
      <motion.div
        aria-hidden
        className={[
          "absolute inset-y-0 left-0 w-1/2",
          "bg-[#004225]",
          "shadow-[0_4px_12px_rgba(0,66,37,0.22)]",
        ].join(" ")}
        initial={false}
        animate={{
          x: `${selectedIndex * 100}%`,
          borderTopLeftRadius: selectedIndex === 0 ? "999px" : "0px",
          borderBottomLeftRadius: selectedIndex === 0 ? "999px" : "0px",
          borderTopRightRadius: selectedIndex === 1 ? "999px" : "0px",
          borderBottomRightRadius: selectedIndex === 1 ? "999px" : "0px",
        }}
        transition={{
          duration: 0.32,
          ease: [0.22, 1, 0.36, 1],
        }}
      />

      {options.map((opt) => {
        const active = opt.key === currentValue;
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={opt.label}
            onClick={() => setValue(opt.key)}
            className={[
              "relative z-10 h-full w-full flex items-center justify-center gap-2 rounded-full",
              "text-xs font-medium tracking-tight",
              "transition-colors duration-200",
              active ? "text-white" : "text-black/80",
            ].join(" ")}
          >
            {opt.icon}
            {showLabels && <span>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default SwitchSelect;
