"use client";

import React, { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export const FlipWords = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const safeWords = useMemo(() => words.filter(Boolean), [words]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [safeWords]);

  useEffect(() => {
    if (safeWords.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % safeWords.length);
    }, duration);

    return () => window.clearInterval(timer);
  }, [duration, safeWords.length]);

  const currentWord = safeWords[index] ?? "";

  return (
    <span className={cn("relative z-10 inline-block px-2 text-left text-foreground", className)}>
      <span key={`${currentWord}-${index}`} className="flip-word inline-block whitespace-nowrap">
        {currentWord}
      </span>
    </span>
  );
};
