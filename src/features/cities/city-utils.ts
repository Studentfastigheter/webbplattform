export const formatCityName = (value: string) => {
  const trimmed = value.normalize("NFC").trim();
  if (!trimmed) return "";

  return trimmed
    .toLocaleLowerCase("sv-SE")
    .replace(/(^|[\s-])\p{L}/gu, (match) => match.toLocaleUpperCase("sv-SE"));
};

export const normalizeCityName = (value: string | null | undefined) =>
  formatCityName(value ?? "");
