"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { GoogleAdSenseUnit } from "@/components/layout/GoogleAdSenseUnit";

type AdColumnsLayoutProps = {
  children: ReactNode;
};

type AdSenseFormat = "auto" | "horizontal" | "vertical" | "rectangle";

const GOOGLE_ADSENSE_SIDEBAR_LEFT_SLOT = "9241310200";
const GOOGLE_ADSENSE_SIDEBAR_RIGHT_SLOT = "3754664320";
const GOOGLE_ADSENSE_BOTTOM_SLOT = "6828539903";

const googleAdSenseSlots = {
  left: GOOGLE_ADSENSE_SIDEBAR_LEFT_SLOT,
  bottom: GOOGLE_ADSENSE_BOTTOM_SLOT,
  right: GOOGLE_ADSENSE_SIDEBAR_RIGHT_SLOT,
};

const AdSlot = ({
  ariaLabel,
  className,
  emptyLabel,
  format,
  googleAdSenseSlot,
  mediaClassName,
}: {
  ariaLabel: string;
  className?: string;
  emptyLabel: string;
  format: AdSenseFormat;
  googleAdSenseSlot?: string;
  mediaClassName: string;
}) => (
  <aside className={cn("w-full", className)} aria-label={ariaLabel}>
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg border border-gray-200 bg-white",
        mediaClassName,
      )}
    >
      {googleAdSenseSlot ? (
        <GoogleAdSenseUnit
          slot={googleAdSenseSlot}
          label={ariaLabel}
          format={format}
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-400"
          aria-label={ariaLabel}
        >
          {emptyLabel}
        </div>
      )}
    </div>
  </aside>
);

const BottomAdSlot = ({
  ariaLabel,
  emptyLabel,
  googleAdSenseSlot,
}: {
  ariaLabel: string;
  emptyLabel: string;
  googleAdSenseSlot?: string;
}) => (
  <AdSlot
    ariaLabel={ariaLabel}
    emptyLabel={emptyLabel}
    format="horizontal"
    googleAdSenseSlot={googleAdSenseSlot}
    className="mx-auto max-w-[970px]"
    mediaClassName="min-h-[100px] max-h-[100px]"
  />
);

const RailAdSlot = ({
  ariaLabel,
  emptyLabel,
  format = "vertical",
  googleAdSenseSlot,
}: {
  ariaLabel: string;
  emptyLabel: string;
  format?: AdSenseFormat;
  googleAdSenseSlot?: string;
}) => (
  <div className="sticky top-24 hidden self-start xl:block">
    <AdSlot
      ariaLabel={ariaLabel}
      emptyLabel={emptyLabel}
      format={format}
      googleAdSenseSlot={googleAdSenseSlot}
      mediaClassName="h-[min(600px,calc(100svh-8rem))] min-h-[420px] max-h-[600px]"
    />
  </div>
);

export default function AdColumnsLayout({ children }: AdColumnsLayoutProps) {
  const { t } = useI18n();
  const emptyLabel = t("ads.adSpace");

  return (
    <div className="flex w-full flex-col gap-6 xl:grid xl:grid-cols-[minmax(160px,12vw)_minmax(0,1fr)_minmax(160px,12vw)] xl:items-start 2xl:grid-cols-[minmax(220px,15vw)_minmax(0,1fr)_minmax(220px,15vw)]">
      <RailAdSlot
        ariaLabel={t("ads.leftAd")}
        emptyLabel={emptyLabel}
        format="vertical"
        googleAdSenseSlot={googleAdSenseSlots.left}
      />

      <div className="w-full min-w-0">
        {children}

        <div className="mt-8">
          <BottomAdSlot
            ariaLabel={t("ads.bottomAd")}
            emptyLabel={emptyLabel}
            googleAdSenseSlot={googleAdSenseSlots.bottom}
          />
        </div>
      </div>

      <RailAdSlot
        ariaLabel={t("ads.rightAd")}
        emptyLabel={emptyLabel}
        format="vertical"
        googleAdSenseSlot={googleAdSenseSlots.right}
      />
    </div>
  );
}
