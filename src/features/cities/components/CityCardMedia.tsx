"use client";

import Image from "next/image";
import { useState } from "react";
import { LOGOMARK_PATH } from "@/features/listings/components/ListingImagePlaceholder";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type CityCardMediaProps = {
  cityName: string;
  imageUrl?: string | null;
  sizes?: string;
  unoptimized?: boolean;
  /** Extra klasser på fotot, t.ex. hover-skalning från kortet. */
  imageClassName?: string;
  labelClassName?: string;
};

const LABEL_BASE_CLASS =
  "absolute bottom-5 left-5 max-w-[calc(100%-2.5rem)] break-words text-[24px] font-medium leading-[1.05] sm:bottom-6 sm:left-6 sm:text-[28px]";

/**
 * Bildytan i ett stadskort, i tre lägen: diskret skeleton-puls medan fotot
 * laddar (namnet i brandgrönt), foto + mörk gradient + vitt namn när det
 * laddat, och husrads-platshållaren med brandgrönt namn när bild saknas
 * eller inte går att ladda. Fyller sin relative-container.
 */
export default function CityCardMedia({
  cityName,
  imageUrl,
  sizes,
  unoptimized,
  imageClassName,
  labelClassName,
}: CityCardMediaProps) {
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  const src = imageUrl && imageUrl !== brokenSrc ? imageUrl : undefined;
  const loaded = Boolean(src) && loadedSrc === src;

  if (!src) {
    return (
      <>
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-brand-25 to-brand-50"
        />
        {/* Avlägsen siluettrand med logotyp-huset, ovanför namnzonen */}
        <svg
          aria-hidden="true"
          viewBox="0 0 470 56"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-x-0 bottom-[72px] h-14 w-full text-brand"
        >
          <path
            d="M0 56 L0 34 H36 L56 16 L76 34 H132 V24 H188 V38 H262 V30 H318 L338 14 L358 30 H414 V38 H470 V56 Z"
            fill="var(--color-brand-100)"
            opacity="0.55"
          />
          <g transform="translate(217.34 21.34) scale(0.0942)">
            <path d={LOGOMARK_PATH} fill="currentColor" fillOpacity="0.3" />
          </g>
          <path d="M0 55 H470" stroke="currentColor" strokeOpacity="0.22" strokeWidth="2" fill="none" />
        </svg>
        <span className={cn(LABEL_BASE_CLASS, "text-brand", labelClassName)}>
          {cityName}
        </span>
      </>
    );
  }

  return (
    <>
      {!loaded && (
        <Skeleton className="absolute inset-0 rounded-none motion-reduce:animate-none" />
      )}
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        unoptimized={unoptimized}
        className={cn(
          "object-cover object-center transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          imageClassName
        )}
        onLoad={() => setLoadedSrc(src)}
        onError={() => setBrokenSrc(src)}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-black/5 via-black/20 to-black/72 transition-opacity group-hover:opacity-95",
          !loaded && "opacity-0"
        )}
      />
      <span
        className={cn(
          LABEL_BASE_CLASS,
          loaded
            ? "text-white [text-shadow:0_1px_14px_rgba(0,0,0,0.42)]"
            : "text-brand",
          labelClassName
        )}
      >
        {cityName}
      </span>
    </>
  );
}
