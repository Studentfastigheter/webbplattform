export const locales = ["sv", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "sv";
export const localeCookieName = "campuslyan_locale";
export const localeCookieMaxAge = 60 * 60 * 24 * 365;

const localePrefix: Record<Locale, string> = {
  sv: "",
  en: "/en",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "sv" || value === "en";
}

export function getLocaleFromPathname(pathname: string): Locale | null {
  const normalized = normalizePathname(pathname);

  if (normalized === "/en" || normalized.startsWith("/en/")) {
    return "en";
  }

  return null;
}

export function stripLocaleFromPathname(pathname: string): string {
  const normalized = normalizePathname(pathname);

  if (normalized === "/en") {
    return "/";
  }

  if (normalized.startsWith("/en/")) {
    return normalized.slice(3) || "/";
  }

  return normalized;
}

export function localizePathname(pathname: string, locale: Locale): string {
  const pathnameWithoutLocale = stripLocaleFromPathname(pathname);

  if (locale === defaultLocale) {
    return pathnameWithoutLocale;
  }

  return `${localePrefix[locale]}${pathnameWithoutLocale === "/" ? "" : pathnameWithoutLocale}`;
}

export function localizeHref(href: string, locale: Locale): string {
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//")
  ) {
    return href;
  }

  if (!href.startsWith("/")) {
    return href;
  }

  if (href.startsWith("/api/") || href === "/api") {
    return href;
  }

  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const searchIndex = withoutHash.indexOf("?");
  const search = searchIndex >= 0 ? withoutHash.slice(searchIndex) : "";
  const pathname = searchIndex >= 0 ? withoutHash.slice(0, searchIndex) : withoutHash;

  return `${localizePathname(pathname || "/", locale)}${search}${hash}`;
}

export function getLocaleFromCookieValue(value: string | null | undefined): Locale | null {
  return isLocale(value) ? value : null;
}

export function getLocaleFromAcceptLanguage(acceptLanguage: string | null): Locale | null {
  if (!acceptLanguage) {
    return null;
  }

  const languages = acceptLanguage
    .split(",")
    .map((part) => {
      const [language = "", quality = "q=1"] = part.trim().split(";");
      const q = quality.startsWith("q=") ? Number(quality.slice(2)) : 1;

      return {
        language: language.toLowerCase(),
        q: Number.isFinite(q) ? q : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { language } of languages) {
    if (language === "sv" || language.startsWith("sv-")) {
      return "sv";
    }

    if (language === "en" || language.startsWith("en-")) {
      return "en";
    }
  }

  return null;
}

export function normalizePathname(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return normalized.length > 1 ? normalized.replace(/\/+$/, "") : normalized;
}
