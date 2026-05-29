export const formatCityName = (value: string) => {
  const trimmed = value.normalize("NFC").trim();
  if (!trimmed) return "";

  return trimmed
    .toLocaleLowerCase("sv-SE")
    .replace(/(^|[\s-])\p{L}/gu, (match) => match.toLocaleUpperCase("sv-SE"));
};

export const normalizeCityName = (value: string | null | undefined) =>
  formatCityName(value ?? "");

const CITY_IMAGE_IDS: Record<string, string> = {
  goteborg: "1663405811054-ca933435bd00",
  gothenburg: "1663405811054-ca933435bd00",
  linkoping: "1775585873112-aa9dff1b5ee4",
  lund: "1728299955742-8102b4c20326",
  malmo: "1715002716983-8f2fac8d930c",
  orebro: "1716727973691-07b6ad5ec095",
  stockholm: "1615390272595-3a43fd928f1b",
  umea: "1651743332051-acf608391fb2",
  uppsala: "1771245682094-127513dc5b2c",
};

const FALLBACK_CITY_IMAGE_ID = "1615390272595-3a43fd928f1b";

const getCityImageKey = (city: string) =>
  city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("sv-SE")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, "-");

const getImageSize = (size: string) => {
  const match = size.match(/^(\d+)x(\d+)$/);

  return {
    height: match?.[2] ?? "425",
    width: match?.[1] ?? "1440",
  };
};

export const getCityImageUrl = (city: string, size = "1440x425") => {
  const imageId = CITY_IMAGE_IDS[getCityImageKey(city)] ?? FALLBACK_CITY_IMAGE_ID;
  const { height, width } = getImageSize(size);

  return `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
};

export const getCityDescription = (city: string) =>
  `${city} är en studentstad med bostäder, köer och områden som passar olika vardagar och studieupplägg. Här kommer du kunna läsa mer om staden, hitta relevanta bostäder och få en bättre överblick över möjligheterna på CampusLyan.`;
