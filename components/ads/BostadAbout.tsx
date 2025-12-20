"use client";

import HousingInfoBox from "@/components/ui/housingInfoBox";
import ReadMoreComponent from "@/components/ui/ReadMoreComponent";
import Tag from "@/components/ui/Tag";
// VIKTIGT: Vi använder nu ListingDetailDTO
import { ListingDetailDTO } from "@/types/listing"; 
import { Home, MapPin } from "lucide-react";
import React from "react";

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-800">
      <span className="text-green-900">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

type Props = {
  // ÄNDRING: Uppdaterad typ
  listing: ListingDetailDTO;
  onApplyClick?: () => void;
  applyDisabled?: boolean;
};

export default function BostadAbout({ listing, onApplyClick, applyDisabled }: Props) {
  
  // Bygg strängen för bostadstyp, rum och storlek
  const dwellingLabel = [
    listing.dwellingType,
    listing.rooms ? `${listing.rooms} rum` : null,
    listing.sizeM2 ? `${listing.sizeM2} m²` : null,
  ]
    .filter(Boolean)
    .join(" / ") || "Information saknas";

  return (
    <section className="grid gap-8 rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)] lg:grid-cols-[1.75fr_0.95fr]">
      {/* Vänsterkolumn */}
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-900">
          Om annonsen
        </p>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            {listing.title}
          </h1>

          {/* Plats (Vi använder listing.location direkt nu) */}
          {listing.location && (
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label={listing.location}
            />
          )}
          
          <InfoRow
            icon={<Home className="h-4 w-4" />}
            label={dwellingLabel}
          />
        </div>

        {/* Taggar */}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {(listing.tags ?? []).map((tag) => (
            <Tag
              key={tag}
              text={tag}
              bgColor="#E9E9E9"
              textColor="#111111"
              height={28}
              horizontalPadding={14}
              fontSize={13}
            />
          ))}
        </div>

        {/* Beskrivning */}
        <ReadMoreComponent
          text={listing.description ?? ""}
          variant="large"
          className="mt-2"
          textClassName="text-base leading-relaxed text-gray-800"
          buttonWrapClassName="pb-4"
          moreLabel="Läs mer"
          lessLabel="Visa mindre"
          scrollOffset={400}
        />
      </div>

      {/* Högerkolumn: prisbox */}
      <div className="lg:justify-self-end">
        <HousingInfoBox
          rent={listing.rent}
          moveInDate={listing.moveIn}
          lastApplyDate={listing.applyBy}
          className="w-full max-w-[280px]"
          onApplyClick={onApplyClick}
          applyDisabled={applyDisabled}
        />
      </div>
    </section>
  );
}