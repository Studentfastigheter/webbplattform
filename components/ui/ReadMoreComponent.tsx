"use client";

import React, {
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
} from "react";
import { motion } from "framer-motion";

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

  const sentenceMatch = slice.match(/([.!?])(?=\s|$)[^.?!]*$/);
  if (
    sentenceMatch &&
    sentenceMatch.index !== undefined &&
    sentenceMatch.index > maxChars * 0.5
  ) {
    return slice.slice(0, sentenceMatch.index + 1);
  }

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
  scrollOffset = 200, // 👈 justerbart offset, default 200px
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

  useEffect(() => {
    const approxCharsPerLine = 100;
    const maxChars = approxCharsPerLine * collapsedLines;
    setCollapsedText(smartTruncate(text, maxChars));
  }, [text, collapsedLines]);

  const targetHeight = expanded ? fullHeight : collapsedHeight;

  const handleToggle = () => {
    setExpanded((prev) => {
      const next = !prev;
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

  const buttonBase =
    "rounded-full px-5 py-2 bg-green-900 text-white text-sm hover:bg-green-800 transition-all shadow flex items-center";

  const smallButton =
    "text-sm text-green-900 underline underline-offset-4 bg-transparent shadow-none px-0 py-0 flex items-center";

  const buttonClass =
    variant === "small" ? smallButton : buttonBase;

  return (
    <div ref={containerRef} className={`w-full relative ${className}`}>
      <motion.div
        animate={{ height: targetHeight, opacity: expanded ? 1 : 0.95 }}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ overflow: "hidden" }}
      >
        <div
          ref={measureRef}
          className={`text-base leading-relaxed ${textClassName}`}
        >
          {expanded ? text : collapsedText}
        </div>
      </motion.div>
      {!expanded && needsToggle && (
        <div className="pointer-events-none absolute bottom-[72px] left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
      )}

      {needsToggle && (
        <div className={`mt-4 flex justify-center ${buttonWrapClassName}`}>
          <button onClick={handleToggle} className={buttonClass}>
            <span>{expanded ? lessLabel : moreLabel}</span>
            <motion.span
              className="inline-block ml-2"
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.25 }}
            >
              ▼
            </motion.span>
          </button>
        </div>
      )}
    </div>
  );
}
/*
Quick usage:
import ReadMore from "@/components/ui/ReadMoreComponent";

<div className="mt-6">
        <ReadMore
          text={sampleText}
          variant="large" // eller "small"
          className="bg-white"
          textClassName="text-lg leading-relaxed"
          buttonWrapClassName="pb-4"
        />
      </div>
*/