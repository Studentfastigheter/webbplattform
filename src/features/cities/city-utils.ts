import type { Locale } from "@/i18n/config";
import { localizedText } from "@/i18n/text";

export const formatCityName = (value: string) => {
  const trimmed = value.normalize("NFC").trim();
  if (!trimmed) return "";

  return trimmed
    .toLocaleLowerCase("sv-SE")
    .replace(/(^|[\s-])\p{L}/gu, (match) => match.toLocaleUpperCase("sv-SE"));
};

export const normalizeCityName = (value: string | null | undefined) =>
  formatCityName(value ?? "");

export const getCityDescription = (city: string, locale: Locale = "sv") =>
  localizedText(
    locale,
    `${city} är en studentstad med bostäder, köer och områden som passar olika vardagar och studieupplägg. Här kommer du kunna läsa mer om staden, hitta relevanta bostäder och få en bättre överblick över möjligheterna på CampusLyan.`,
    `${city} is a student city with homes, queues and areas suited to different routines and study plans. Here you can learn more about the city, find relevant homes and get a clearer overview of the opportunities on CampusLyan.`,
  );
