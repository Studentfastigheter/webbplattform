"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

// Logomarkens path (public/logos/campuslyan-logo.svg, viewBox 375×375) —
// återanvänds som mitthuset i gatumotivet och i stadskortens siluettrand.
export const LOGOMARK_PATH =
  "M 37.5 239.269531 L 93.289062 278.109375 L 93.289062 141.976562 L 186.304688 76.121094 L 187.042969 75.726562 L 187.507812 75.390625 L 187.96875 75.726562 L 281.722656 141.90625 L 281.722656 270.183594 L 173.164062 270.183594 L 125.28125 303.726562 L 125.28125 367.90625 L 184.855469 326.070312 L 281.722656 326.101562 L 332.910156 326.125 L 335.230469 326.125 L 335.992188 326.128906 L 337.507812 326.128906 L 337.507812 113.011719 L 281.722656 73.621094 L 235.871094 41.25 L 187.96875 7.429688 L 187.507812 7.101562 L 187.042969 7.429688 L 139.140625 41.25 L 93.289062 73.621094 L 37.5 113.011719 Z";

type ListingImagePlaceholderProps = {
  className?: string;
  /** Sätt när omgivningen redan bär informationen (t.ex. stadskort med synligt namn). */
  decorative?: boolean;
};

/**
 * Platshållare för annonser utan foto: en linjetecknad husrad i brand-grönt
 * med logotyp-huset i mitten. Bottenförankrad (xMidYMax slice) så motivet
 * beskärs från sidorna/toppen och husraden alltid syns, oavsett bildformat.
 */
const ListingImagePlaceholder: React.FC<ListingImagePlaceholderProps> = ({
  className,
  decorative = false,
}) => {
  const { locale } = useI18n();
  const gradientId = useId();

  return (
    <svg
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : localizedText(locale, "Ingen bild", "No image")}
      aria-hidden={decorative || undefined}
      viewBox="0 0 470 294"
      preserveAspectRatio="xMidYMax slice"
      className={cn("block h-full w-full text-brand", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-brand-25)" />
          <stop offset="1" stopColor="var(--color-brand-50)" />
        </linearGradient>
      </defs>

      {/* Papper + jord under marklinjen */}
      <rect width="470" height="294" fill={`url(#${gradientId})`} />
      <rect y="246" width="470" height="48" fill="var(--color-brand-100)" opacity="0.25" />

      {/* Blek sol — uppe till vänster; hjärtknapp/statustagg ligger uppe till höger */}
      <circle cx="88" cy="82" r="30" fill="white" fillOpacity="0.75" />

      {/* Avlägsen siluett bakom husraden */}
      <path
        d="M0 246 L0 220 L36 220 L56 198 L76 220 L132 220 L132 208 L188 208 L188 224 L258 224 L282 200 L306 224 L368 224 L368 212 L430 212 L446 226 L470 226 L470 246 Z"
        fill="var(--color-brand-100)"
        opacity="0.5"
      />

      {/* Logotyp-huset, mitt i raden */}
      <g transform="translate(197.5 172.59) scale(0.2)">
        <path d={LOGOMARK_PATH} fill="currentColor" fillOpacity="0.55" />
      </g>

      {/* Husrad i tunna linjer */}
      <g
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.34"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Träd */}
        <path d="M44 246 V226" />
        <circle cx="44" cy="212" r="13" fill="var(--color-brand-100)" fillOpacity="0.7" />
        <path d="M420 246 V230" />
        <circle cx="420" cy="219" r="10" fill="var(--color-brand-100)" fillOpacity="0.7" />

        {/* Sadeltakshus med dörr */}
        <path d="M84 246 V196 L123 170 L162 196 V246" />
        <path d="M113 246 V222 Q113 218 117 218 H127 Q131 218 131 222 V246" />
        <circle cx="123" cy="192" r="6" />
        <rect x="138" y="212" width="14" height="14" rx="1" />

        {/* Funkislänga med tänt fönster */}
        <path d="M290 246 V190 H376 V246" />
        <rect x="304" y="202" width="16" height="16" rx="1" />
        <rect x="304" y="226" width="16" height="16" rx="1" />
        <rect x="340" y="226" width="16" height="16" rx="1" />
        <rect
          x="340"
          y="202"
          width="16"
          height="16"
          rx="1"
          fill="currentColor"
          fillOpacity="0.14"
        />

        {/* Marklinje */}
        <path d="M0 246 H470" strokeOpacity="0.3" />
      </g>
    </svg>
  );
};

export default ListingImagePlaceholder;
