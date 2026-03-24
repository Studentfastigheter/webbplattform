"use client"; // Krävs för att useEffect ska fungera i Next.js App Router

import { type ReactNode, useEffect, useState } from "react";
import { listingService } from "@/services/listing-service";
import { cn } from "@/lib/utils";

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
  if (/^(data:image\/|https?:\/\/)/i.test(trimmed)) return trimmed;
  return `data:image/png;base64,${trimmed}`;
};

const extractImageFromData = (data: unknown): string | null => {
  if (!data) return null;
  if (typeof data === "string") return normalizeImageSource(data);

  if (Array.isArray(data)) {
    for (const item of data) {
      const normalized = extractImageFromData(item);
      if (normalized) return normalized;
    }
    return null;
  }

  if (typeof data === "object") {
    // FIX: Lade till "imageUrl" eftersom det är nyckeln som används i DataLoader.java
    const candidates = ["imageUrl", "image", "src", "url", "data"] as const;
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

const AdSlot = ({
  ad,
  ariaLabel,
  className,
}: {
  ad?: NormalizedAd;
  ariaLabel: string;
  className?: string;
}) => (
  <div
    className={cn(
      "relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm",
      className
    )}
  >
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

// Vi gör om denna till en vanlig funktion som använder state för att fungera i webbläsaren
export default function AdColumnsLayout({ children }: AdColumnsLayoutProps) {
  const [ads, setAds] = useState<NormalizedAd[]>([]);

  useEffect(() => {
    async function loadAds() {
      try {
        const rawAds = await listingService.getCurrentAds();
        const normalized = rawAds
          .map((ad, idx) => {
            const src = extractImageFromData(ad.data);
            if (!src) return null;

            return {
              id: String(ad.id ?? idx),
              src,
              alt: ad.company ? `Annons från ${ad.company}` : "Annons",
            } as NormalizedAd;
          })
          .filter((ad): ad is NormalizedAd => ad !== null);

        setAds(normalized);
      } catch (error) {
        console.error("Failed to load ads:", error);
      }
    }
    loadAds();
  }, []);

  const [firstAd, secondAd] = ads;

  return (
    <div className="flex w-full flex-col gap-6 lg:grid lg:grid-cols-[minmax(120px,15vw)_minmax(0,1fr)_minmax(120px,15vw)] lg:items-start">
      {/* Mobile Top Ad */}
      <div className="block lg:hidden w-full">
        <AdSlot
          ad={firstAd}
          ariaLabel="Toppannons"
          className="aspect-[4/1] min-h-[100px]"
        />
      </div>

      {/* Desktop Left Ad */}
      <div className="hidden lg:block sticky top-24 self-start">
        <AdSlot
          ad={firstAd}
          ariaLabel="Vänster annonsyta"
          className="aspect-[2/5] min-h-[480px] max-h-[760px]"
        />
      </div>

      {/* Main Content */}
      <div className="w-full min-w-0">
        {children}

        {/* Mobile Bottom Ad (inserted after content) */}
        <div className="block lg:hidden w-full mt-8">
          <AdSlot
            ad={secondAd}
            ariaLabel="Bottenannons"
            className="aspect-[4/1] min-h-[100px]"
          />
        </div>
      </div>

      {/* Desktop Right Ad */}
      <div className="hidden lg:block sticky top-24 self-start">
        <AdSlot
          ad={secondAd}
          ariaLabel="Höger annonsyta"
          className="aspect-[2/5] min-h-[480px] max-h-[760px]"
        />
      </div>
    </div>
  );
}