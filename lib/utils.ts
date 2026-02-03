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