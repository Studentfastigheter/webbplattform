export const formatCityName = (value: string) => {
  const trimmed = value.normalize("NFC").trim();
  if (!trimmed) return "";

  return trimmed
    .toLocaleLowerCase("sv-SE")
    .replace(/(^|[\s-])\p{L}/gu, (match) => match.toLocaleUpperCase("sv-SE"));
};

export const normalizeCityName = (value: string | null | undefined) =>
  formatCityName(value ?? "");

export const getCityImageUrl = (city: string, size = "1440x425") =>
  `https://source.unsplash.com/${size}/?${encodeURIComponent(
    `${city} Sweden city`
  )}`;

export const getCityDescription = (city: string) =>
  `${city} är en studentstad med bostäder, köer och områden som passar olika vardagar och studieupplägg. Här kommer du kunna läsa mer om staden, hitta relevanta bostäder och få en bättre överblick över möjligheterna på CampusLyan.`;
