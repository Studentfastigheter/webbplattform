import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Keep only unique elements in array
export function uniqueOnly<E>(arr: E[]) {
  return Array.from(new Set<E>(arr)) as E[];
}

// Remove all empty elements from the array (I.e elements that match Boolean -> false)
export function removeEmpty<E>(arr: E[]) {
  return arr.filter(Boolean);
}

// Ensure the provided value is a string, and that it has a searchable format (no spaces and lower-case)
export function toSearchString<E>(item: E) {
  return item && typeof item === "string" ? item.trim().toLowerCase() : "";
}

// True when the provided search string is either empty (not specified) or equal to the target string
export function searchStringMatches(searchString: string, targetString: string) {
  return !searchString || toSearchString(searchString) === toSearchString(targetString);
}



