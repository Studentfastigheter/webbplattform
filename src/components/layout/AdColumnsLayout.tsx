"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { GoogleAdSenseUnit } from "@/components/layout/GoogleAdSenseUnit";
import { useCurrentAds } from "@/features/ads/hooks/useAds";
import type { PlatformAd } from "@/features/ads/services/ad-service";

type AdColumnsLayoutProps = {
  children: ReactNode;
};

type AdSenseFormat = "auto" | "horizontal" | "vertical" | "rectangle";
type PlatformAdSlot = "left" | "bottom" | "right";

const GOOGLE_ADSENSE_SIDEBAR_LEFT_SLOT = "9241310200";
const GOOGLE_ADSENSE_SIDEBAR_RIGHT_SLOT = "3754664320";
const GOOGLE_ADSENSE_BOTTOM_SLOT = "6828539903";

const googleAdSenseSlots = {
  left: GOOGLE_ADSENSE_SIDEBAR_LEFT_SLOT,
  bottom: GOOGLE_ADSENSE_BOTTOM_SLOT,
  right: GOOGLE_ADSENSE_SIDEBAR_RIGHT_SLOT,
};

const adSlotPlacements: Record<PlatformAdSlot, readonly string[]> = {
  left: ["left", "sidebar-left", "rail-left"],
  bottom: ["bottom", "footer", "horizontal"],
  right: ["right", "sidebar-right", "rail-right"],
};

function isRenderablePlatformAd(ad: PlatformAd | undefined): ad is PlatformAd {
  return Boolean(ad?.imageUrl || ad?.headline || ad?.body || ad?.company);
}

function safeExternalUrl(value: string | undefined) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function safeImageUrl(value: string | undefined) {
  if (!value) return undefined;
  if (value.startsWith("/")) return value;
  return safeExternalUrl(value);
}

function pickPlatformAd(
  ads: PlatformAd[],
  slot: PlatformAdSlot,
  fallbackIndex: number
) {
  const placements = adSlotPlacements[slot];
  const explicitAd = ads.find((ad) => {
    const placement = ad.placement?.trim().toLowerCase();
    return placement ? placements.includes(placement) : false;
  });

  return explicitAd ?? ads[fallbackIndex];
}

const PlatformAdCreative = ({
  ad,
  ariaLabel,
}: {
  ad: PlatformAd;
  ariaLabel: string;
}) => {
  const linkUrl = safeExternalUrl(ad.linkUrl);
  const imageUrl = safeImageUrl(ad.imageUrl);
  const headline = ad.headline ?? ad.company ?? ariaLabel;
  const body = ad.body;
  const ctaText = ad.ctaText;
  const creative = (
    <div className="absolute inset-0 flex h-full w-full flex-col bg-[#0f2f24] text-white">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={headline}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative mt-auto flex flex-col gap-2 p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-tight">
          {headline}
        </p>
        {body ? (
          <p className="line-clamp-2 text-xs leading-snug text-white/85">{body}</p>
        ) : null}
        {ctaText ? (
          <span className="w-fit rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-[#0f2f24]">
            {ctaText}
          </span>
        ) : null}
      </div>
    </div>
  );

  return linkUrl ? (
    <a
      href={linkUrl}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      aria-label={headline}
      className="absolute inset-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {creative}
    </a>
  ) : (
    creative
  );
};

const AdSlot = ({
  ad,
  ariaLabel,
  className,
  format,
  googleAdSenseSlot,
  mediaClassName,
}: {
  ad?: PlatformAd;
  ariaLabel: string;
  className?: string;
  format: AdSenseFormat;
  googleAdSenseSlot?: string;
  mediaClassName: string;
}) => {
  const hasPlatformAd = isRenderablePlatformAd(ad);

  if (!hasPlatformAd && !googleAdSenseSlot) {
    return null;
  }

  return (
    <aside className={cn("w-full", className)} aria-label={ariaLabel}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-lg",
          // Synlig ram bara när vi själva ritar en annons. En ofylld
          // AdSense-yta ska vara osynlig — aldrig en tom vit platshållarbox.
          hasPlatformAd && "border border-gray-200 bg-white",
          mediaClassName,
        )}
      >
        {hasPlatformAd ? (
          <PlatformAdCreative ad={ad} ariaLabel={ariaLabel} />
        ) : googleAdSenseSlot ? (
          <GoogleAdSenseUnit
            slot={googleAdSenseSlot}
            label={ariaLabel}
            format={format}
          />
        ) : null}
      </div>
    </aside>
  );
};

const BottomAdSlot = ({
  ad,
  ariaLabel,
  googleAdSenseSlot,
}: {
  ad?: PlatformAd;
  ariaLabel: string;
  googleAdSenseSlot?: string;
}) => (
  <AdSlot
    ad={ad}
    ariaLabel={ariaLabel}
    format="horizontal"
    googleAdSenseSlot={googleAdSenseSlot}
    className="mx-auto max-w-[970px]"
    mediaClassName="min-h-[100px] max-h-[100px]"
  />
);

const RailAdSlot = ({
  ad,
  ariaLabel,
  format = "vertical",
  googleAdSenseSlot,
}: {
  ad?: PlatformAd;
  ariaLabel: string;
  format?: AdSenseFormat;
  googleAdSenseSlot?: string;
}) => (
  <div className="sticky top-24 hidden self-start xl:block">
    <AdSlot
      ad={ad}
      ariaLabel={ariaLabel}
      format={format}
      googleAdSenseSlot={googleAdSenseSlot}
      mediaClassName="h-[min(600px,calc(100svh-8rem))] min-h-[420px] max-h-[600px]"
    />
  </div>
);

export default function AdColumnsLayout({ children }: AdColumnsLayoutProps) {
  const { t } = useI18n();
  const { data: platformAds = [] } = useCurrentAds();
  const leftAd = pickPlatformAd(platformAds, "left", 0);
  const bottomAd = pickPlatformAd(platformAds, "bottom", 1);
  const rightAd = pickPlatformAd(platformAds, "right", 2);

  return (
    <div className="flex w-full flex-col gap-6 xl:grid xl:grid-cols-[minmax(160px,12vw)_minmax(0,1fr)_minmax(160px,12vw)] xl:items-start 2xl:grid-cols-[minmax(220px,15vw)_minmax(0,1fr)_minmax(220px,15vw)]">
      <RailAdSlot
        ad={leftAd}
        ariaLabel={t("ads.leftAd")}
        format="vertical"
        googleAdSenseSlot={googleAdSenseSlots.left}
      />

      <div className="w-full min-w-0">
        {children}

        <div className="mt-8">
          <BottomAdSlot
            ad={bottomAd}
            ariaLabel={t("ads.bottomAd")}
            googleAdSenseSlot={googleAdSenseSlots.bottom}
          />
        </div>
      </div>

      <RailAdSlot
        ad={rightAd}
        ariaLabel={t("ads.rightAd")}
        format="vertical"
        googleAdSenseSlot={googleAdSenseSlots.right}
      />
    </div>
  );
}
