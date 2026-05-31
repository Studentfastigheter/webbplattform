import type { Locale } from "@/i18n/config";

export function localizedText(locale: Locale, sv: string, en: string) {
  return locale === "en" ? en : sv;
}

export function numberLocale(locale: Locale) {
  return locale === "en" ? "en-US" : "sv-SE";
}

export function formatLocalizedNumber(locale: Locale, value: number) {
  return value.toLocaleString(numberLocale(locale));
}

export function formatLocalizedCurrency(locale: Locale, value: number) {
  const amount = value.toLocaleString(numberLocale(locale), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return locale === "en" ? `SEK ${amount}/mo` : `${amount} kr/mån`;
}

export function formatLocalizedDate(locale: Locale, value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const dateLocale = locale === "en" ? "en-US" : "sv-SE";

  return date.toLocaleDateString(dateLocale);
}

export function formatLocalizedDateTime(locale: Locale, value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const dateLocale = locale === "en" ? "en-US" : "sv-SE";

  return new Intl.DateTimeFormat(dateLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function localizedCount(
  locale: Locale,
  count: number,
  svSingular: string,
  svPlural: string,
  enSingular: string,
  enPlural: string,
) {
  const label =
    locale === "en"
      ? count === 1
        ? enSingular
        : enPlural
      : count === 1
        ? svSingular
        : svPlural;

  return `${formatLocalizedNumber(locale, count)} ${label}`;
}
