"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export type FilterButtonProps = {
  children?: React.ReactNode;
  triggerLabel?: string;
  title?: string;
  applyLabel?: string;
  clearLabel?: string;
  resultsLabel?: string;
  onApply?: () => void;
  onClear?: () => void;
  className?: string;
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
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`
          flex items-center gap-2 rounded-[999px] border border-black/15
          bg-white px-4 py-2 text-[13px] font-medium text-black shadow-[0_4px_8px_rgba(0,0,0,0.08)]
          transition hover:shadow-[0_6px_14px_rgba(0,0,0,0.12)]
          ${className}
        `}
      >
        <span className="rounded-full bg-black/5 p-1 text-black">
          <SliderIcon />
        </span>
        {triggerLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-10 sm:px-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
            onClick={close}
          />

          <div
            role="dialog"
            aria-modal="true"
            className="
              relative z-10 w-full max-w-[640px]
              overflow-hidden rounded-[32px] bg-white text-black
              shadow-[0_32px_80px_rgba(0,0,0,0.3)]
            "
          >
            <header className="flex items-center justify-between border-b border-black/10 px-6 py-5">
              <div className="h-6 w-6" />
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                type="button"
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5"
              >
                <span className="sr-only">Stäng</span>
                <CloseIcon />
              </button>
            </header>

            <div
              className="
                max-h-[calc(90vh-150px)] overflow-y-auto px-6 py-6
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

            <footer className="flex flex-col gap-3 border-t border-black/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <Button
                size="sm"
                variant="text"
                onClick={onClear}
                className="px-6 py-3 underline-offset-2 hover:underline"
              >
                {clearLabel}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onApply?.();
                  close();
                }}
                className="px-6 py-3"
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
