"use client";

import React, {
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { RichText } from "@/components/ui/RichText";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

type Variant = "small" | "large";

interface ReadMoreProps {
  text: string;
  variant?: Variant;

  collapsedLinesSmall?: number;
  collapsedLinesLarge?: number;

  className?: string;
  textClassName?: string;
  buttonWrapClassName?: string;

  moreLabel?: string;
  lessLabel?: string;

  /** Hur långt ovanför komponenten du vill hamna vid auto-scroll (t.ex. navbarhöjd + luft) */
  scrollOffset?: number;
}

export default function ReadMoreComponent({
  text,
  variant = "small",
  collapsedLinesSmall = 3,
  collapsedLinesLarge = 6,
  className = "",
  textClassName = "",
  buttonWrapClassName = "",
  moreLabel,
  lessLabel,
  scrollOffset = 200,
}: ReadMoreProps) {
  const { locale } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);

  const [collapsedHeight, setCollapsedHeight] = useState<number>(0);
  const [fullHeight, setFullHeight] = useState<number>(0);

  const measureRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const collapsedLines =
    variant === "small" ? collapsedLinesSmall : collapsedLinesLarge;

  // Beräkna höjder baserat på full text
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const computeHeights = () => {
      const style = window.getComputedStyle(el);
      const lineHeightValue = parseFloat(style.lineHeight || "0");
      const fontSize = parseFloat(style.fontSize || "0");
      const fallbackLineHeight = Number.isFinite(fontSize) ? fontSize * 1.5 : 24;
      const lineHeight =
        Number.isFinite(lineHeightValue) && lineHeightValue > 0
          ? lineHeightValue < fallbackLineHeight * 0.8
            ? lineHeightValue * fontSize
            : lineHeightValue
          : fallbackLineHeight;
      const paddingTop = parseFloat(style.paddingTop || "0");
      const paddingBottom = parseFloat(style.paddingBottom || "0");
      const full = el.scrollHeight;
      const collapsed =
        lineHeight * collapsedLines + paddingTop + paddingBottom;

      setFullHeight(full);
      setCollapsedHeight(collapsed);

      setNeedsToggle(full > collapsed + 1);
    };

    computeHeights();

    const ro = new ResizeObserver(computeHeights);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, collapsedLines]);

  const targetHeight = needsToggle
    ? expanded
      ? fullHeight
      : collapsedHeight
    : fullHeight;
  const resolvedMoreLabel = moreLabel ?? localizedText(locale, "Läs mer", "Read more");
  const resolvedLessLabel = lessLabel ?? localizedText(locale, "Visa mindre", "Show less");

  const handleToggle = () => {
    setExpanded((prev) => {
      const next = !prev;

      // När vi stänger: scrolla upp så början av texten syns snyggt
      if (prev && !next && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollTop =
          typeof window !== "undefined"
            ? window.scrollY ?? document.documentElement.scrollTop
            : 0;

        const targetY = rect.top + scrollTop - scrollOffset;

        if (typeof window !== "undefined") {
          window.scrollTo({
            top: targetY,
            behavior: "smooth",
          });
        }
      }

      return next;
    });
  };

  return (
    <div ref={containerRef} className={`w-full relative ${className}`}>
      <motion.div
        animate={{ height: targetHeight, opacity: expanded ? 1 : 0.97 }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ overflow: "hidden" }}
      >
        <div className="relative">
          <RichText
            ref={measureRef}
            text={text}
            className={`text-base leading-relaxed ${textClassName}`}
          />

          {/* Gradient i botten när texten är kollapsad */}
          {!expanded && needsToggle && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>
      </motion.div>

      {needsToggle && (
        <div
          className={`
            ${buttonWrapClassName}
            mt-3 flex w-full items-center justify-center
          `}
        >
          <div className="flex justify-center">
            <Button
              onClick={handleToggle}
              variant="text"
              size="sm"
            >
              <span>{expanded ? resolvedLessLabel : resolvedMoreLabel}</span>
              
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
