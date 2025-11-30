"use client";

import React, {
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
} from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/button";

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

function smartTruncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;

  const slice = text.slice(0, maxChars);

  // Försök kapa vid slutet på en mening
  const sentenceMatch = slice.match(/([.!?])(?=\s|$)[^.?!]*$/);
  if (
    sentenceMatch &&
    sentenceMatch.index !== undefined &&
    sentenceMatch.index > maxChars * 0.5
  ) {
    return slice.slice(0, sentenceMatch.index + 1);
  }

  // Annars kapa vid senaste mellanslag
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > maxChars * 0.4) {
    return slice.slice(0, lastSpace) + "…";
  }
  return slice + "…";
}

export default function ReadMoreComponent({
  text,
  variant = "small",
  collapsedLinesSmall = 3,
  collapsedLinesLarge = 6,
  className = "",
  textClassName = "",
  buttonWrapClassName = "",
  moreLabel = "Läs mer",
  lessLabel = "Visa mindre",
  scrollOffset = 200,
}: ReadMoreProps) {
  const [expanded, setExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);

  const [collapsedHeight, setCollapsedHeight] = useState<number>(0);
  const [fullHeight, setFullHeight] = useState<number>(0);

  const [collapsedText, setCollapsedText] = useState<string>(text);

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
      const lineHeight = parseFloat(style.lineHeight || "0");
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

  // Ta fram en kortare text för "collapsed"-läget
  useEffect(() => {
    const approxCharsPerLine = 100;
    const maxChars = approxCharsPerLine * collapsedLines;
    setCollapsedText(smartTruncate(text, maxChars));
  }, [text, collapsedLines]);

  const targetHeight = expanded ? fullHeight : collapsedHeight;

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
        <div className="relative max-w-prose mx-auto">
          <div
            ref={measureRef}
            className={`text-base leading-relaxed ${textClassName}`}
          >
            {expanded ? text : collapsedText}
          </div>

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
          <div className="max-w-prose mx-auto flex justify-center">
            <Button
              onClick={handleToggle}
              className={`
                flex 
                items-center 
                justify-center 
                w-full h-[31px]
                rounded-full
                bg-[#004323] text-white
                text-[14px] leading-[16px]
                normal-case
                shadow-[0_3px_4px_rgba(0,0,0,0.25)]
              `}
            >
              <span>{expanded ? lessLabel : moreLabel}</span>
              <motion.span
                className="inline-block"
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.25 }}
              >
                ▼
              </motion.span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
