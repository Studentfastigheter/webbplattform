"use client";

import { Check } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { localizeHref, type Locale } from "@/i18n/config";

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
  inverted?: boolean;
};

const flagByLocale: Record<Locale, string> = {
  sv: "\uD83C\uDDF8\uD83C\uDDEA",
  en: "\uD83C\uDDEC\uD83C\uDDE7",
};

export function LanguageSwitcher({
  className,
  compact: _compact = false,
  inverted = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  const getCurrentHref = () => {
    if (typeof window !== "undefined") {
      return `${window.location.pathname}${window.location.search}${window.location.hash}`;
    }

    return `${pathname}${query ? `?${query}` : ""}`;
  };

  const handleSelect = (nextLocale: Locale) => {
    if (nextLocale === locale) return;

    const nextHref = localizeHref(getCurrentHref(), nextLocale);

    setLocale(nextLocale);
    router.push(nextHref);
  };

  const options: { locale: Locale; label: string; shortLabel: string }[] = [
    { locale: "sv", label: t("common.swedish"), shortLabel: "SV" },
    { locale: "en", label: t("common.english"), shortLabel: "EN" },
  ];
  const activeOption = options.find((option) => option.locale === locale) ?? options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center text-xl leading-none transition hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004225]/35",
            inverted
              ? "text-white focus-visible:ring-white/60"
              : "text-neutral-900",
            className,
          )}
          aria-label={t("common.language")}
        >
          <span aria-hidden>{flagByLocale[activeOption.locale]}</span>
          <span className="sr-only">{activeOption.label}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-40 rounded-md border-neutral-200 p-1 shadow-[0_14px_34px_rgba(15,23,42,0.12)]">
        {options.map((option) => {
          const isActive = option.locale === locale;

          return (
            <DropdownMenuItem
              key={option.locale}
              onSelect={() => handleSelect(option.locale)}
              className="flex cursor-pointer items-center gap-2 rounded px-2.5 py-2 text-sm font-medium"
            >
              <span aria-hidden className="text-lg leading-none">{flagByLocale[option.locale]}</span>
              <span className="flex-1">{option.label}</span>
              {isActive && <Check className="h-4 w-4 text-[#004225]" aria-hidden />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
