import {
  apiClient,
  arrayFromApiResponse,
  type ServiceOptions,
} from "@/lib/api/client";

export type PlatformAd = {
  id: number;
  start?: string | null;
  stop?: string | null;
  company?: string | null;
  data?: unknown;
  imageUrl?: string;
  linkUrl?: string;
  headline?: string;
  body?: string;
  ctaText?: string;
  placement?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const stringValue = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

function readString(
  source: Record<string, unknown>,
  data: Record<string, unknown>,
  keys: string[]
) {
  for (const key of keys) {
    const value = stringValue(data[key]) ?? stringValue(source[key]);
    if (value) return value;
  }

  return undefined;
}

function normalizePlatformAd(value: unknown): PlatformAd | null {
  if (!isRecord(value)) return null;

  const id = Number(value.id);
  if (!Number.isFinite(id)) return null;

  const data = isRecord(value.data) ? value.data : {};

  return {
    id,
    start: stringValue(value.start) ?? null,
    stop: stringValue(value.stop) ?? null,
    company: stringValue(value.company) ?? null,
    data: value.data,
    imageUrl: readString(value, data, ["imageUrl", "image", "bannerUrl", "src"]),
    linkUrl: readString(value, data, ["linkUrl", "url", "href", "targetUrl"]),
    headline: readString(value, data, ["headline", "title"]),
    body: readString(value, data, ["body", "description", "text"]),
    ctaText: readString(value, data, ["ctaText", "cta", "buttonText"]),
    placement: readString(value, data, ["placement", "slot", "position"]),
  };
}

export const adService = {
  current: async (options?: ServiceOptions): Promise<PlatformAd[]> => {
    const ads = await apiClient<unknown>("/ads/current", {
      auth: false,
      signal: options?.signal,
    });

    return arrayFromApiResponse<unknown>(ads)
      .map(normalizePlatformAd)
      .filter((ad): ad is PlatformAd => ad !== null);
  },
};
