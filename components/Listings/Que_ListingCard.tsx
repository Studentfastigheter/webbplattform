import React from "react";
import { Button } from "@heroui/button";
import Tag from "../ui/Tag";
import VerifiedTag from "../ui/VerifiedTag";

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
    <div className="w-[460px] rounded-[24px] bg-white shadow-md px-5 py-4 flex flex-col gap-3">
      {/* Top: badge + name + location + logo */}
      <div className="flex items-start justify-between gap-3">
        {/* Vänster: Verified + namn + location/units */}
        <div className="flex flex-col items-start gap-1">
          {isVerified && (
            <div className="inline-flex w-fit">
              <VerifiedTag />
            </div>
          )}

          <h3 className="text-xl font-semibold leading-snug">
            {name}
          </h3>

          {/* Location + units flyttat hit så det alltid ligger nära namnet */}
          <div className="mt-1 space-y-1 text-[13px] text-black">
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
        </div>

        {/* Höger: logo – kan växa utan att skapa extra gap mellan namn och stad */}
        <div className="flex h-24 w-24 items-center justify-center shrink-0">
          <img
            src={logoUrl}
            alt={logoAlt ?? name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {tags.map((tag) => (
            <Tag
              key={tag}
              text={tag}
              bgColor="#F0F0F0"
              textColor="black"
            />
          ))}
        </div>
      )}

      {/* Buttons */}
      <div className="mt-1 flex gap-3">
        <Button
          type="button"
          onClick={onViewListings}
          className="flex-1 rounded-full bg-[#DCDCDC] px-4 py-2 text-sm"
        >
          Visa bostäder
        </Button>
        <Button
          type="button"
          onClick={onReadMore}
          className="flex-1 rounded-full bg-[#0F4D0F] px-4 py-2 text-sm text-white"
        >
          Läs mer
        </Button>
      </div>
    </div>
  );
};

export default Que_ListingCard;
