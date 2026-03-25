"use client";

import HousingInfoBox from "@/components/ui/housingInfoBox";
import ReadMoreComponent from "@/components/ui/ReadMoreComponent";
import Tag from "@/components/ui/Tag";
import { ListingDetailDTO } from "@/types/listing";
import { Check, Heart, Home, MapPin, Share2 } from "lucide-react";
import React, { useState } from "react";
import EditWrapper from "@/app/(business_portal)/_components/EditWrapper";
import BostadForm from "./BostadForm";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/ui/ShareDialog";
import { listingService } from "@/services/listing-service";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-800">
      <span className="text-green-900">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function BostadAboutContent({
  listing,
  isFavorite,
  onApplyClick,
  applyDisabled,
  hasApplied,
  dwellingLabel,
}: {
  listing: ListingDetailDTO;
  isFavorite?: boolean;
  onApplyClick?: () => void;
  applyDisabled?: boolean;
  hasApplied?: boolean;
  dwellingLabel: string;
}) {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(isFavorite ?? false);
  const [isLoadingFav, setIsLoadingFav] = useState(false);

  React.useEffect(() => {
    if (isFavorite !== undefined) setIsFav(isFavorite);
  }, [isFavorite]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoadingFav) return;

    const prev = isFav;
    setIsFav(!prev);
    setIsLoadingFav(true);
    try {
      if (!prev) await listingService.addFavorite(listing.id);
      else await listingService.removeFavorite(listing.id);
    } catch {
      setIsFav(prev);
    } finally {
      setIsLoadingFav(false);
    }
  };

  const isRentNumber = typeof listing.rent === "number";
  const rentValue = isRentNumber ? listing.rent!.toLocaleString("sv-SE") : "Ej angiven";

  return (
    <div className="flex flex-col gap-6">
      {/* Header row: title left, actions+price+button right */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-4 min-w-0">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-balance">
              {listing.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="h-4 w-4 text-green-700" />
                {listing.fullAddress ? `${listing.fullAddress}, ${listing.city}` : [listing.area, listing.city].filter(Boolean).join(", ")}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Home className="h-4 w-4 text-green-700" />
                {dwellingLabel}
              </span>
            </div>
          </div>

          {/* Date info — same level as price on right */}
          {(listing.availableFrom || listing.availableTo || listing.moveIn || listing.applyBy) && (
            <div className="flex flex-wrap gap-y-4">
              {[
                { label: "Tillgänglig från", value: listing.availableFrom || "Inte angivet" },
                { label: "Tillgänglig till", value: listing.availableTo || "Tillsvidare" },
                { label: "Inflyttning", value: listing.moveIn || "Inte angivet" },
                { label: "Sista ansökan", value: listing.applyBy || "Inte angivet" },
              ].map((item, index) => (
                <div key={item.label} className={`flex flex-col pr-4 ${index > 0 ? "border-l border-gray-200 pl-4" : ""}`}>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900 mt-1">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: actions, price, button */}
        <div className="flex shrink-0 flex-col items-end gap-3">
          {/* Favorite + Share */}
          <div className="flex items-center gap-1.5">
            {user && (
              <button
                type="button"
                onClick={handleToggleFavorite}
                disabled={isLoadingFav}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                  isFav
                    ? "text-red-500 hover:bg-red-50"
                    : "text-gray-400 hover:bg-gray-100 hover:text-red-500"
                )}
                aria-label={isFav ? "Ta bort från favoriter" : "Lägg till i favoriter"}
              >
                <Heart className={cn("h-[18px] w-[18px]", isFav && "fill-current")} />
              </button>
            )}
            {user && (
              <div className="h-5 w-px bg-gray-200" />
            )}
            <ShareDialog>
              <button
                type="button"
                aria-label="Dela bostad"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <Share2 className="h-[18px] w-[18px]" />
              </button>
            </ShareDialog>
          </div>

          {/* Price */}
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Månadshyra
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                {rentValue}
              </span>
              {isRentNumber && (
                <span className="text-sm font-medium text-gray-400">kr/mån</span>
              )}
            </div>
          </div>

          {/* Apply button */}
          {hasApplied ? (
            <div className={cn(
              "h-11 px-8 flex items-center justify-center gap-2",
              "rounded-full",
              "bg-green-100 text-green-800",
              "text-[14px] font-medium",
              "border border-green-200"
            )}>
              <Check className="h-4 w-4" />
              Du har ansökt
            </div>
          ) : (
            <Button
              onClick={onApplyClick}
              disabled={applyDisabled}
              className={cn(
                "h-11 px-8 flex items-center justify-center gap-2",
                "rounded-full",
                "bg-[#004225] text-white",
                "text-[14px] font-medium",
                "shadow-sm hover:shadow-md transition-all",
                "hover:bg-[#00331b] active:scale-[0.98]"
              )}
            >
              Skicka ansökan
            </Button>
          )}
        </div>
      </div>

      {/* Tags */}
      {listing.tags && listing.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {listing.tags.map((tag) => (
            <Tag
              key={tag}
              text={tag}
              bgColor="#F3F4F6"
              textColor="#1F2937"
              height={28}
              horizontalPadding={14}
              fontSize={13}
            />
          ))}
        </div>
      )}

      {/* Description */}
      <div className="mt-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-100 pb-2">Om boendet</h2>
        <ReadMoreComponent
          text={listing.description ?? ""}
          variant="large"
          className="mt-2"
          textClassName="text-[15px] leading-relaxed text-gray-700"
          buttonWrapClassName="pb-4"
          moreLabel="Läs mer"
          lessLabel="Visa mindre"
          scrollOffset={400}
        />
      </div>
    </div>
  );
}

type Props = {
  listing: ListingDetailDTO;
  onApplyClick?: () => void;
  applyDisabled?: boolean;
  hasApplied?: boolean;
  isEditable?: boolean;
  isFavorite?: boolean;
};

export default function BostadAbout({
  listing,
  onApplyClick,
  applyDisabled,
  hasApplied,
  isEditable = false,
  isFavorite,
}: Props) {
  
  // Bygg strängen för bostadstyp, rum och storlek
  const dwellingLabel = [
    listing.dwellingType,
    listing.rooms ? `${listing.rooms} rum` : null,
    listing.sizeM2 ? `${listing.sizeM2} m²` : null,
  ]
    .filter(Boolean)
    .join(" / ") || "Information saknas";

  return (
    
    <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
      {/* Vänsterkolumn */}
      
      {isEditable ? (
        <EditWrapper isEditable={isEditable}>
          <BostadForm listing={listing}>
            <div className="flex flex-col gap-4 border border-dashed rounded-xl p-3 -m-3 border-neutral-300 hover:border-neutral-400 cursor-pointer">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-900">
                Om annonsen
                </p>

                <div className="flex flex-col gap-1 items-baseline">
                <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl relative">
                    {listing.title}
                </h1>
                
        <HousingInfoBox
          listingId={listing.id}  // NY: Skicka med annons-ID
          isFavorite={isFavorite}
          rent={listing.rent}
          moveInDate={listing.moveIn}
          lastApplyDate={listing.applyBy}
          className="w-full max-w-[280px]"
          onApplyClick={onApplyClick}
          applyDisabled={applyDisabled}
        />
                {/* Två rader med ikon + text, ingen chip-bakgrund */}
                {(listing.fullAddress || listing.area) && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label={listing.fullAddress ? `${listing.fullAddress}, ${listing.city}` : [listing.area, listing.city].filter(Boolean).join(", ")}
                  />
                )}
                <InfoRow
                    icon={<Home className="h-4 w-4" />}
                    label={dwellingLabel}
                />
                </div>

                <div className="flex flex-wrap gap-y-4 border-y border-gray-100 py-4 mt-2 mb-2">
                  {[
                    { label: "Tillgänglig från", value: listing.availableFrom || "Inte angivet" },
                    { label: "Tillgänglig till", value: listing.availableTo || "Tillsvidare" },
                    { label: "Inflyttning", value: listing.moveIn || "Inte angivet" },
                    { label: "Sista ansökan", value: listing.applyBy || "Inte angivet" },
                  ].map((item, index) => (
                    <div key={item.label} className={`flex flex-col pr-4 ${index > 0 ? "border-l border-gray-200 pl-4" : ""}`}>
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{item.label}</span>
                      <span className="text-sm font-medium text-gray-900 mt-1">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Taggar som chips under raderna */}
                <div className="mt-1 flex flex-wrap items-center gap-2">
                {listing.tags.map((tag) => (
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

                <ReadMoreComponent
                text={listing.description}
                variant="large"
                className="mt-2"
                textClassName="text-base leading-relaxed text-gray-800"
                buttonWrapClassName="pb-4"
                moreLabel="Läs mer"
                lessLabel="Visa mindre"
                scrollOffset={400}
                />
            </div>
          </BostadForm>
        </EditWrapper>
      ) : (
        <BostadAboutContent
          listing={listing}
          isFavorite={isFavorite}
          onApplyClick={onApplyClick}
          applyDisabled={applyDisabled}
          hasApplied={hasApplied}
          dwellingLabel={dwellingLabel}
        />
      )}
    </section>
  );
}
