import { cookies, headers } from "next/headers";

import {
  defaultLocale,
  getLocaleFromAcceptLanguage,
  getLocaleFromCookieValue,
  isLocale,
  localeCookieName,
  type Locale,
} from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";

export async function getRequestLocale(): Promise<Locale> {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  const headerLocale = headerStore.get("x-campuslyan-locale");

  return (
    (isLocale(headerLocale) ? headerLocale : null) ??
    getLocaleFromCookieValue(cookieStore.get(localeCookieName)?.value) ??
    getLocaleFromAcceptLanguage(headerStore.get("accept-language")) ??
    defaultLocale
  );
}

export async function getDictionary() {
  const locale = await getRequestLocale();

  return dictionaries[locale];
}
