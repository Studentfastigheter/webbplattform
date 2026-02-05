import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { format, isToday, isYesterday, differenceInCalendarDays } from "date-fns"
import { sv } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Formats a date as a relative Swedish date string, e.g., "Idag", "Igår", "3 dagar sedan", or a formatted date.
export function relativeSwedishDate(
  date: Date,
  opts?: { maxDays?: number; fallbackFormat?: string }
) {
  const maxDays = opts?.maxDays ?? 7
  const fallbackFormat = opts?.fallbackFormat ?? "yyyy-MM-dd"

  if (isToday(date)) return "Idag"
  if (isYesterday(date)) return "Igår"

  const days = differenceInCalendarDays(new Date(), date) // calendar-days, not hours

  if (days > 0 && days <= maxDays) {
    return `${days} dagar sedan`
  }

  // If it's in the future or older than maxDays, show a date (or "Imorgon" if you want)
  return format(date, fallbackFormat, { locale: sv })
}

export function lowestCommonRoute(knownRoutes: string[], currentUrl: string): string {
  // Normalize (remove trailing slashes except root)
  const normalize = (p: string) =>
    p === "/" ? "/" : p.replace(/\/+$/, "");

  const current = normalize(currentUrl);

  let bestMatch = "/";

  for (const route of knownRoutes) {
    const r = normalize(route);

    // Must match whole path segment (avoid /home matching /home2)
    if (
      current === r ||
      current.startsWith(r + "/")
    ) {
      // Pick the longest valid match
      if (r.length > bestMatch.length) {
        bestMatch = r;
      }
    }
  }

  return bestMatch;
}

export function checkSameRoute(a: string, b: string): boolean {
  const normalize = (url: string) => {
    // Remove query string & hash
    const clean = url.split(/[?#]/)[0];

    // Remove trailing slashes except root
    return clean === "/" ? "/" : clean.replace(/\/+$/, "");
  };

  return normalize(a) === normalize(b);
}


export function normalizeRoute(url: string): string {
  // remove query/hash, trim trailing slash (except "/")
  const clean = url.split(/[?#]/)[0];
  return clean === "/" ? "/" : clean.replace(/\/+$/, "");
}