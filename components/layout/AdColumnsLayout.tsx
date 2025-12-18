import { type ReactNode } from "react";

// ÄNDRING: Importera service och typer från den nya strukturen
import { listingService } from "@/services/listing-service";
import { type RollingAd } from "@/types";

type NormalizedAd = {
  id: string;
  src: string;
  alt: string;
};

type AdColumnsLayoutProps = {
  children: ReactNode;
};

const normalizeImageSource = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Accept full data-URIs or remote URLs as-is, otherwise assume raw base64 data.
  if (/^(data:image\/|https?:\/\/)/i.test(trimmed)) return trimmed;
  return `data:image/png;base64,${trimmed}`;
};

const extractImageFromData = (data: unknown): string | null => {
  if (!data) return null;

  // Plain string (base64, data-URI, URL)
  if (typeof data === "string") return normalizeImageSource(data);

  // Array: pick the first usable entry
  if (Array.isArray(data)) {
    for (const item of data) {
      const normalized = extractImageFromData(item);
      if (normalized) return normalized;
    }
    return null;
  }

  // Object: look for common keys or nested data
  if (typeof data === "object") {
    const candidates = ["image", "src", "url", "data"] as const;
    for (const key of candidates) {
      const maybe = (data as Record<string, unknown>)[key];
      if (typeof maybe === "string") {
        const normalized = normalizeImageSource(maybe);
        if (normalized) return normalized;
      } else if (maybe && typeof maybe === "object") {
        const normalized = extractImageFromData(maybe);
        if (normalized) return normalized;
      }
    }
  }

  return null;
};

async function getCurrentAds(): Promise<NormalizedAd[]> {
  try {
    // ÄNDRING: Använd listingService
    const ads = await listingService.getCurrentAds();
    return ads
      .map((ad, idx) => {
        const src = extractImageFromData(ad.data);
        if (!src) return null;

        return {
          id: String(ad.id ?? idx),
          src,
          alt: ad.company ? `Annons från ${ad.company}` : "Annons",
        } as NormalizedAd;
      })
      .filter(Boolean) as NormalizedAd[];
  } catch {
    return [];
  }
}

const AdSlot = ({ ad, ariaLabel }: { ad?: NormalizedAd; ariaLabel: string }) => (
  <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm aspect-[2/5] min-h-[480px] max-h-[760px]">
    {ad ? (
      <img
        src={ad.src}
        alt={ad.alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    ) : (
      <div
        className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-400"
        aria-label={ariaLabel}
      >
        Annonsutrymme
      </div>
    )}
  </div>
);

const AdColumnsLayout = async ({ children }: AdColumnsLayoutProps) => {
  const ads = await getCurrentAds();
  const [leftAd, rightAd] = ads;

  return (
    <div className="grid w-full grid-cols-[minmax(120px,15vw)_minmax(0,1fr)_minmax(120px,15vw)] items-start gap-6">
      <div className="sticky top-24 self-start">
        <AdSlot ad={leftAd} ariaLabel="Vänster annonsyta" />
      </div>
      <div className="min-w-0">{children}</div>
      <div className="sticky top-24 self-start">
        <AdSlot ad={rightAd} ariaLabel="Höger annonsyta" />
      </div>
    </div>
  );
};

export default AdColumnsLayout;