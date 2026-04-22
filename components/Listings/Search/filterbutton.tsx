"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export type FilterButtonProps = {
  children?: React.ReactNode;
  triggerLabel?: React.ReactNode;
  title?: string;
  applyLabel?: string;
  clearLabel?: string;
  resultsLabel?: string;
  onApply?: () => void;
  onClear?: () => void;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "text";
  size?: "md" | "sm" | "lg" | "icon" | "icon-lg";
};

const SliderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    className="h-4 w-4"
  >
    <line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round" />
    <circle cx="10" cy="6" r="2" />
    <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
    <circle cx="15" cy="12" r="2" />
    <line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round" />
    <circle cx="7" cy="18" r="2" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    className="h-5 w-5"
  >
    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
    <line x1="6" y1="18" x2="18" y2="6" strokeLinecap="round" />
  </svg>
);

const FilterButton: React.FC<FilterButtonProps> = ({
  children,
  triggerLabel = "Filter",
  title = "Filter",
  applyLabel = "Visa resultat",
  clearLabel = "Rensa alla",
  resultsLabel,
  onApply,
  onClear,
  className = "",
  variant = "ghost",
  size = "lg",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);

    return () => {
      body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const showApplyLabel = useMemo(() => {
    if (resultsLabel) return resultsLabel;
    return applyLabel;
  }, [resultsLabel, applyLabel]);

  const hasContent = React.Children.count(children) > 0;

  return (
    <>
      <Button
        size={size}
        variant={variant as any}
        onClick={() => setIsOpen(true)}
        className={className}
      >
          <SliderIcon />
        {triggerLabel}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex min-h-svh items-center justify-center px-3 py-4 sm:px-6 sm:py-8">
          <div
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={close}
          />

          <div
            role="dialog"
            aria-modal="true"
            className="
              relative z-[1] flex max-h-[calc(100svh-2rem)] w-full max-w-[640px]
              flex-col overflow-hidden rounded-3xl bg-white text-black
              shadow-[0_32px_90px_rgba(0,0,0,0.35)] sm:max-h-[min(760px,calc(100svh-4rem))]
            "
          >
            <header className="flex shrink-0 items-center justify-between border-b border-black/10 px-5 py-4 sm:px-6 sm:py-5">
              <div className="h-6 w-6" />
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                type="button"
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10"
              >
                <span className="sr-only">Stäng</span>
                <CloseIcon />
              </button>
            </header>

            <div
              className="
                min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6
                scrollbar-thin scrollbar-track-transparent scrollbar-thumb-black/20
              "
            >
              {hasContent ? (
                children
              ) : (
                <p className="text-center text-sm text-black/60">
                  Inga filter är konfigurerade ännu.
                </p>
              )}
            </div>

            <footer className="flex shrink-0 flex-col gap-3 border-t border-black/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
              <Button
                size="sm"
                variant="text"
                onClick={onClear}
              >
                {clearLabel}
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  onApply?.();
                  close();
                }}
              >
                {showApplyLabel}
              </Button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterButton;
