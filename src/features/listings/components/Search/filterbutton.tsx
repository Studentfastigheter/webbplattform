"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

export type FilterButtonProps = {
  children?: React.ReactNode;
  triggerLabel?: React.ReactNode;
  title?: string;
  applyLabel?: string;
  clearLabel?: string;
  resultsLabel?: string;
  resultsMeta?: React.ReactNode;
  resultsLoading?: boolean;
  applyDisabled?: boolean;
  onApply?: () => void;
  onClear?: () => void;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "text";
  size?: "md" | "sm" | "lg" | "icon" | "icon-lg";
};

const FilterButton: React.FC<FilterButtonProps> = ({
  children,
  triggerLabel,
  title,
  applyLabel,
  clearLabel,
  resultsLabel,
  resultsMeta,
  resultsLoading = false,
  applyDisabled = false,
  onApply,
  onClear,
  className = "",
  variant = "ghost",
  size = "lg",
}) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const resolvedTriggerLabel = triggerLabel ?? t("filters.filter");
  const resolvedTitle = title ?? t("filters.filter");
  const resolvedApplyLabel = applyLabel ?? t("filters.apply");
  const resolvedClearLabel = clearLabel ?? t("filters.clearAll");

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
    return resolvedApplyLabel;
  }, [resultsLabel, resolvedApplyLabel]);

  const hasContent = React.Children.count(children) > 0;

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={variant as any}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        {resolvedTriggerLabel}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex min-h-svh items-end justify-center px-0 sm:items-center sm:px-6 sm:py-8">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={close}
          />

          <div
            role="dialog"
            aria-modal="true"
            className="
              relative z-[1] flex max-h-[92svh] w-full max-w-[720px]
              flex-col overflow-hidden rounded-t-2xl border border-white/80
              bg-[#fbfcff] text-black shadow-[0_28px_90px_rgba(15,23,42,0.32)]
              sm:max-h-[min(780px,calc(100svh-4rem))] sm:rounded-2xl
            "
          >
            <header className="flex shrink-0 items-center justify-between border-b border-black/10 bg-white/95 px-4 py-3 sm:px-5 sm:py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden />
                </span>
                <h2 className="truncate text-base font-semibold sm:text-lg">
                  {resolvedTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-black/60 transition hover:bg-black/5 hover:text-black"
              >
                <span className="sr-only">{t("filters.close")}</span>
                <X className="h-5 w-5" aria-hidden />
              </button>
            </header>

            <div
              className="
                min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-5 sm:py-5
                scrollbar-thin scrollbar-track-transparent scrollbar-thumb-black/20
              "
            >
              {hasContent ? (
                children
              ) : (
                <p className="text-center text-sm text-black/60">
                  {t("filters.notConfigured")}
                </p>
              )}
            </div>

            <footer className="flex shrink-0 flex-col gap-3 border-t border-black/10 bg-white/95 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
              <Button
                type="button"
                size="sm"
                variant="text"
                onClick={onClear}
                className="w-full justify-center sm:w-auto"
              >
                {resolvedClearLabel}
              </Button>
              <div className="flex flex-col items-stretch gap-2 sm:items-end">
                {resultsMeta && (
                  <div className="min-h-4 text-center text-xs text-black/55 sm:text-right">
                    {resultsMeta}
                  </div>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  isDisabled={applyDisabled}
                  onClick={() => {
                    onApply?.();
                    close();
                  }}
                  className={cn(
                    "w-full justify-center sm:w-auto",
                    resultsLoading && "cursor-wait",
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    {resultsLoading && (
                      <span
                        aria-hidden
                        className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      />
                    )}
                    {showApplyLabel}
                  </span>
                </Button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterButton;
