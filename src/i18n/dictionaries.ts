import type { Locale } from "@/i18n/config";
import en from "@/i18n/dictionaries/en.json";
import sv from "@/i18n/dictionaries/sv.json";

export const dictionaries = {
  sv,
  en,
} as const satisfies Record<Locale, typeof sv>;

export type Dictionary = typeof sv;
