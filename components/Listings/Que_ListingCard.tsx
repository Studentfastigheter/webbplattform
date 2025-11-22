// components/listings/Que_ListingCard.tsx

import React from "react";
import { Button } from "@heroui/button";

export type QueListingCardProps = {
  name: string;                // "SGS Studentbostäder"
  area: string;                // "Innerstan"
  city: string;                // "Göteborg"
  totalUnits?: number;         // 900
  unitsLabel?: string;         // override text, t.ex. "900 bostäder"
  isVerified?: boolean;        // visar gröna badgen
  logoUrl: string;
  logoAlt?: string;
  tags?: string[];             // ["Kristet", "Korridorer", "Lägenheter"]
  onViewListings?: () => void; // "Visa bostäder"
  onReadMore?: () => void;     // "Läs mer"
};

const Que_ListingCard: React.FC<QueListingCardProps> = ({
  name,
  area,
  city,
  totalUnits,
  unitsLabel,
  isVerified = false,
  logoUrl,
  logoAlt,
  tags = [],
  onViewListings,
  onReadMore,
}) => {
  const unitsText =
    unitsLabel ?? (totalUnits ? `${totalUnits} bostäder` : undefined);

  return (
    <div className="w-[360px] rounded-[24px] bg-white shadow-md px-5 py-4 flex flex-col gap-3">
      {/* Top: badge + name + logo */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          {isVerified && (
            <span className="inline-flex items-center rounded-full bg-[#0F4D0F] px-3 py-1 text-[11px] font-medium text-white">
              Verifierad hyresvärd
            </span>
          )}
          <h3 className="text-[16px] font-semibold leading-snug">
            {name}
          </h3>
        </div>

        <div className="h-10 w-20 flex items-center justify-center">
          <img
            src={logoUrl}
            alt={logoAlt ?? name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>

      {/* Location + units */}
      <div className="space-y-1 text-[13px] text-black">
        <div className="flex items-center gap-2">
          {/* Ikon-placeholder – byt till riktig ikon om du vill */}
          <span className="inline-block h-[12px] w-[12px] rounded-full border border-gray-500" />
          <span>
            {area}, {city}
          </span>
        </div>

        {unitsText && (
          <div className="flex items-center gap-2">
            {/* Ikon-placeholder – byt till riktig ikon */}
            <span className="inline-block h-[12px] w-[12px] border border-gray-500 rounded-[2px]" />
            <span>{unitsText}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#F5F5F5] px-3 py-1 text-[12px]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div className="mt-1 flex gap-3">
        <Button
          type="button"
          onClick={onViewListings}
          className="flex-1 rounded-full bg-[#E5E5E5] px-4 py-2 text-[13px]"
        >
          Visa bostäder
        </Button>
        <Button
          type="button"
          onClick={onReadMore}
          className="flex-1 rounded-full bg-[#0F4D0F] px-4 py-2 text-[13px] text-white"
        >
          Läs mer
        </Button>
      </div>
    </div>
  );
};

export default Que_ListingCard;
