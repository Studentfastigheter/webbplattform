import { useLang, ENGLISH, SWEDISH } from "@/context/LangContext";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

type Props = {
    className?: string,
    disabled?: boolean,
    fullWidth?: boolean,
};

export default function LanguageToggle({
  className = "",
  disabled = false,
  fullWidth = false,
}: Props) {
    const { setLang } = useLang();
    const [ selectedIndex, setSelectedIndex ] = useState<number>(0);
    const widthClass = fullWidth
    ? "w-full"
    : "w-[128px] sm:w-[144px] xl:w-[152px]";

    const options = [ 
        {
            key: SWEDISH,
            index: 0,
            label: "Svenska", 
        },
        {
            key: ENGLISH,
            index: 1,
            label: "English",
        },
    ];

    useEffect(() => {
        setLang([SWEDISH, ENGLISH][selectedIndex]);
    }, [selectedIndex]);

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
        const active = opt.index === selectedIndex;
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={opt.label}
            onClick={() => { 
                setSelectedIndex(opt.index); 
            }}
            className={[
              "relative z-10 h-full w-full flex items-center justify-center gap-2 rounded-full",
              "text-xs font-medium tracking-tight",
              "transition-colors duration-200",
              active ? "text-white" : "text-black/80",
            ].join(" ")}
          >
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
    );
}

