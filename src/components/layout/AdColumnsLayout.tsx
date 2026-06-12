"use client";

import { type ReactNode, useMemo } from "react";
import { useCurrentAds } from "@/features/ads/hooks/useAds";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { GoogleAdSenseUnit } from "@/components/layout/GoogleAdSenseUnit";

type NormalizedAd = {
  id: string;
  src: string;
  alt: string;
};

type AdColumnsLayoutProps = {
  children: ReactNode;
};

const GOOGLE_ADSENSE_DEFAULT_SLOT = "9241310200";

const normalizeAdSenseSlot = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed || undefined;
};

const getAdSenseSlot = (...values: Array<string | undefined>): string => {
  for (const value of values) {
    const normalized = normalizeAdSenseSlot(value);
    if (normalized) return normalized;
  }

  return GOOGLE_ADSENSE_DEFAULT_SLOT;
};

const googleAdSenseSlots = {
  top: getAdSenseSlot(
    process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_TOP_SLOT,
    process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PRIMARY_SLOT,
  ),
  left: getAdSenseSlot(
    process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_LEFT_SLOT,
    process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PRIMARY_SLOT,
  ),
  bottom: getAdSenseSlot(
    process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_BOTTOM_SLOT,
    process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SECONDARY_SLOT,
  ),
  right: getAdSenseSlot(
    process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_RIGHT_SLOT,
    process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SECONDARY_SLOT,
  ),
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
  emptyLabel,
  googleAdSenseSlot,
}: {
  ad?: NormalizedAd;
  ariaLabel: string;
  className?: string;
  emptyLabel: string;
  googleAdSenseSlot?: string;
}) => (
  <div
    className={cn(
      "relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm",
      className,
    )}
  >
    {ad ? (
      <img
        src={ad.src}
        alt={ad.alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    ) : googleAdSenseSlot ? (
      <GoogleAdSenseUnit slot={googleAdSenseSlot} label={ariaLabel} />
    ) : (
      <div
        className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-400"
        aria-label={ariaLabel}
      >
        {emptyLabel}
      </div>
    )}
  </div>
);

export default function AdColumnsLayout({ children }: AdColumnsLayoutProps) {
  const { t } = useI18n();
  const { data: rawAds = [] } = useCurrentAds();

  // Normalize and translate alt text on read. Locale changes (t) re-derive
  // alt without re-fetching — keeping the network call cached across SSR/CSR
  // re-renders and across components that mount AdColumnsLayout in parallel.
  const ads = useMemo<NormalizedAd[]>(
    () =>
      rawAds
        .map((ad, idx) => {
          const src = extractImageFromData(ad.data);
          if (!src) return null;
          return {
            id: String(ad.id ?? idx),
            src,
            alt: ad.company ? t("ads.adFrom", { company: ad.company }) : t("ads.ad"),
          } as NormalizedAd;
        })
        .filter((ad): ad is NormalizedAd => ad !== null),
    [rawAds, t],
  );

  const [firstAd, secondAd] = ads;

  return (
    <div className="flex w-full flex-col gap-6 lg:grid lg:grid-cols-[minmax(120px,15vw)_minmax(0,1fr)_minmax(120px,15vw)] lg:items-start">
      <div className="block w-full lg:hidden">
        <AdSlot
          ad={firstAd}
          ariaLabel={t("ads.topAd")}
          emptyLabel={t("ads.adSpace")}
          googleAdSenseSlot={googleAdSenseSlots.top}
          className="aspect-[4/1] min-h-[100px]"
        />
      </div>

      <div className="sticky top-24 hidden self-start lg:block">
        <AdSlot
          ad={firstAd}
          ariaLabel={t("ads.leftAd")}
          emptyLabel={t("ads.adSpace")}
          googleAdSenseSlot={googleAdSenseSlots.left}
          className="aspect-[2/5] min-h-[480px] max-h-[760px]"
        />
      </div>

      <div className="w-full min-w-0">
        {children}

        <div className="mt-8 block w-full lg:hidden">
          <AdSlot
            ad={secondAd}
            ariaLabel={t("ads.bottomAd")}
            emptyLabel={t("ads.adSpace")}
            googleAdSenseSlot={googleAdSenseSlots.bottom}
            className="aspect-[4/1] min-h-[100px]"
          />
        </div>
      </div>

      <div className="sticky top-24 hidden self-start lg:block">
        <AdSlot
          ad={secondAd}
          ariaLabel={t("ads.rightAd")}
          emptyLabel={t("ads.adSpace")}
          googleAdSenseSlot={googleAdSenseSlots.right}
          className="aspect-[2/5] min-h-[480px] max-h-[760px]"
        />
      </div>
    </div>
  );
}
