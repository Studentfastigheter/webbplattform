"use client";

import type { FormEvent } from "react";

import { Search, X } from "@/components/icons";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  placeholder: string;
  submitLabel: string;
  clearLabel: string;
  onClear?: () => void;
  className?: string;
};

export function SearchBar({
  value,
  onValueChange,
  onSubmit,
  placeholder,
  submitLabel,
  clearLabel,
  onClear,
  className,
}: SearchBarProps) {
  return (
    <form
      className={cn(
        "flex h-11 w-full items-center gap-2 rounded-full border border-black/10 bg-white py-1.5 pl-4 pr-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.08)] sm:h-12 sm:gap-3 sm:pl-5 xl:pl-6 xl:pr-1",
        className
      )}
      onSubmit={onSubmit}
    >
      <Search className="h-[18px] w-[18px] shrink-0 text-black/55 sm:h-5 sm:w-5" />
      <input
        type="text"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/45 sm:text-base"
      />
      {value && onClear ? (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={onClear}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-brand transition-colors hover:bg-brand/5 sm:h-8 sm:w-8"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      ) : null}
      <button
        type="submit"
        className="h-8 shrink-0 rounded-full bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand/90 sm:h-9 sm:px-5 xl:h-10 xl:px-6"
      >
        {submitLabel}
      </button>
    </form>
  );
}
