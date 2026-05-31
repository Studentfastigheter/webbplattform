"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import {
  defaultLocale,
  getLocaleFromAcceptLanguage,
  getLocaleFromCookieValue,
  getLocaleFromPathname,
  localeCookieMaxAge,
  localeCookieName,
  localizeHref,
  type Locale,
} from "@/i18n/config";
import { dictionaries, type Dictionary } from "@/i18n/dictionaries";

type TranslationParams = Record<string, string | number>;

type I18nContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  t: (key: string, params?: TranslationParams) => string;
  setLocale: (nextLocale: Locale) => void;
  localizedHref: (href: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readLocaleCookie() {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${localeCookieName}=`));

  return getLocaleFromCookieValue(match?.split("=")[1]);
}

function writeLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${localeCookieName}=${locale}; path=/; max-age=${localeCookieMaxAge}; samesite=lax`;
}

function getBrowserLocale() {
  if (typeof navigator === "undefined") {
    return null;
  }

  return getLocaleFromAcceptLanguage(navigator.languages?.join(",") || navigator.language);
}

function getValue(dictionary: Dictionary, key: string) {
  return key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, dictionary);
}

function interpolate(value: string, params?: TranslationParams) {
  if (!params) {
    return value;
  }

  return Object.entries(params).reduce(
    (text, [key, replacement]) => text.replaceAll(`{${key}}`, String(replacement)),
    value,
  );
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const pathname = usePathname() || "/";
  const [preferenceLocale, setPreferenceLocale] = useState<Locale>(initialLocale);
  const pathnameLocale = getLocaleFromPathname(pathname);
  const locale = pathnameLocale ?? preferenceLocale;
  const dictionary = dictionaries[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const nextLocale =
      getLocaleFromPathname(pathname) ??
      readLocaleCookie() ??
      getBrowserLocale() ??
      defaultLocale;

    setPreferenceLocale(nextLocale);
  }, [pathname]);

  const setLocale = useCallback((nextLocale: Locale) => {
    writeLocaleCookie(nextLocale);
    setPreferenceLocale(nextLocale);
  }, []);

  const localizedHref = useCallback(
    (href: string) => localizeHref(href, locale),
    [locale],
  );

  const t = useCallback(
    (key: string, params?: TranslationParams) => {
      const value = getValue(dictionary, key);

      if (typeof value !== "string") {
        return key;
      }

      return interpolate(value, params);
    },
    [dictionary],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dictionary,
      t,
      setLocale,
      localizedHref,
    }),
    [dictionary, locale, localizedHref, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider.");
  }

  return context;
}
