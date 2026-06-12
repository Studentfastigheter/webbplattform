"use client";

import EditWrapper from "@/app/portal/_components/EditWrapper";
import { ShareDialog } from "@/components/ui/ShareDialog";
import { Button } from "@/components/ui/button";
import ReadMoreComponent from "@/components/ui/ReadMoreComponent";
import Tag from "@/components/ui/Tag";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { canUseFavorites, useToggleFavorite } from "@/features/listings/hooks/useListings";
import { ListingDetailDTO } from "@/types/listing";
import { Check, Heart, Home, MapPin, Share2 } from "lucide-react";
import React, { useState } from "react";
import BostadForm from "./BostadForm";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { formatLocalizedNumber, localizedText } from "@/i18n/text";

const DWELLING_TYPE_LABELS: Record<string, { sv: string; en: string }> = {
  APARTMENT: { sv: "Lägenhet", en: "Apartment" },
  ROOM: { sv: "Rum", en: "Room" },
  CORRIDOR_ROOM: { sv: "Korridorsrum", en: "Corridor room" },
  apartment: { sv: "Lägenhet", en: "Apartment" },
  room: { sv: "Rum", en: "Room" },
  corridor_room: { sv: "Korridorsrum", en: "Corridor room" },
};

function formatDwellingType(value: string, locale: Locale) {
  const label = DWELLING_TYPE_LABELS[value];
  return label ? localizedText(locale, label.sv, label.en) : value;
}

const getListingTagLabel = (tag: ListingDetailDTO["tags"][number]) =>
  typeof tag === "string" ? tag : tag.displayName || tag.tagKey || "";

function BostadAboutContent({
  listing,
  isFavorite,
  onApplyClick,
  applyDisabled,
  hasApplied,
  dwellingLabel,
  hideStudentActions = false,
  onFavoriteToggle,
}: {
  listing: ListingDetailDTO;
  isFavorite?: boolean;
  onApplyClick?: () => void;
  applyDisabled?: boolean;
  hasApplied?: boolean;
  dwellingLabel: string;
  hideStudentActions?: boolean;
  onFavoriteToggle?: (id: string, isFav: boolean) => void | Promise<void>;
}) {
  const { user } = useAuth();
  const { locale } = useI18n();
  // Standalone (no parent-controlled prop) fallback for local optimism. The
  // parent normally drives `isFavorite` from `useFavorites().data`, but this
  // component is also embedded in standalone surfaces (preview pages) where
  // no parent state exists — those rely on the local `isFav` mirror.
  const [isFav, setIsFav] = useState(isFavorite ?? false);
  const toggleFavorite = useToggleFavorite();
  const isLoadingFav = toggleFavorite.isPending;
  const canFavorite = canUseFavorites(user);

  React.useEffect(() => {
    if (isFavorite !== undefined) setIsFav(isFavorite);
  }, [isFavorite]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canFavorite || isLoadingFav) return;

    const prev = isFav;
    setIsFav(!prev);
    try {
      if (onFavoriteToggle) {
        await onFavoriteToggle(listing.id, !prev);
      } else {
        // Hook owns optimistic patch + rollback on the shared favorites
        // cache; we still mirror the toggle locally because parents that
        // don't use the cache rely on this component's own `isFav` state.
        await toggleFavorite.mutateAsync({
          listingId: listing.id,
          nextIsFavorite: !prev,
        });
      }
    } catch {
      setIsFav(prev);
    }
  };

  const isRentNumber =
    typeof listing.rent === "number" &&
    Number.isFinite(listing.rent) &&
    listing.rent > 0;
  const rentValue = isRentNumber
    ? formatLocalizedNumber(locale, listing.rent)
    : localizedText(locale, "Ej angiven", "Not specified");
  const dateItems = [
    {
      label: localizedText(locale, "Tillgänglig från", "Available from"),
      value: listing.availableFrom || localizedText(locale, "Inte angivet", "Not specified"),
    },
    {
      label: localizedText(locale, "Tillgänglig till", "Available until"),
      value: listing.availableTo || localizedText(locale, "Tillsvidare", "Until further notice"),
    },
    {
      label: localizedText(locale, "Inflyttning", "Move-in"),
      value: listing.moveIn || localizedText(locale, "Inte angivet", "Not specified"),
    },
    {
      label: localizedText(locale, "Sista ansökan", "Apply by"),
      value: listing.applyBy || localizedText(locale, "Inte angivet", "Not specified"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-4 min-w-0">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-balance">
              {listing.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="h-4 w-4 text-green-700" />
                {listing.fullAddress
                  ? `${listing.fullAddress}, ${listing.city}`
                  : [listing.area, listing.city].filter(Boolean).join(", ")}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Home className="h-4 w-4 text-green-700" />
                {dwellingLabel}
              </span>
            </div>
          </div>

          {(listing.availableFrom || listing.availableTo || listing.moveIn || listing.applyBy) && (
            <div className="flex flex-wrap gap-y-4">
              {dateItems.map((item, index) => (
                <div
                  key={item.label}
                  className={`flex flex-col pr-4 ${index > 0 ? "border-l border-gray-200 pl-4" : ""}`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {item.label}
                  </span>
                  <span className="text-sm font-medium text-gray-900 mt-1">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          {!hideStudentActions && (
            <div className="flex items-center gap-1.5">
              {canFavorite && (
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  disabled={isLoadingFav}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                    isFav
                      ? "text-red-500 hover:bg-red-50"
                      : "text-gray-400 hover:bg-gray-100 hover:text-red-500",
                  )}
                  aria-label={
                    isFav
                      ? localizedText(locale, "Ta bort från favoriter", "Remove from favorites")
                      : localizedText(locale, "Lägg till i favoriter", "Add to favorites")
                  }
                >
                  <Heart className={cn("h-[18px] w-[18px]", isFav && "fill-current")} />
                </button>
              )}
              {canFavorite && <div className="h-5 w-px bg-gray-200" />}
              <ShareDialog>
                <button
                  type="button"
                  aria-label={localizedText(locale, "Dela bostad", "Share listing")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <Share2 className="h-[18px] w-[18px]" />
                </button>
              </ShareDialog>
            </div>
          )}

          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              {localizedText(locale, "Månadshyra", "Monthly rent")}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                {rentValue}
              </span>
              {isRentNumber && (
                <span className="text-sm font-medium text-gray-400">
                  {localizedText(locale, "kr/mån", "SEK/mo")}
                </span>
              )}
            </div>
          </div>

          {!hideStudentActions && (
            hasApplied ? (
              <div
                className={cn(
                  "h-11 px-8 flex items-center justify-center gap-2",
                  "rounded-full",
                  "bg-green-100 text-green-800",
                  "text-[14px] font-medium",
                  "border border-green-200",
                )}
              >
                <Check className="h-4 w-4" />
                {localizedText(locale, "Du har ansökt", "You have applied")}
              </div>
            ) : (
              <Button
                onClick={onApplyClick}
                isDisabled={applyDisabled}
                className={cn(
                  "h-11 px-8 flex items-center justify-center gap-2",
                  "rounded-full",
                  "bg-[#004225] text-white",
                  "text-[14px] font-medium",
                  "shadow-sm hover:shadow-md transition-all",
                  "hover:bg-[#00331b] active:scale-[0.98]",
                )}
              >
                {localizedText(locale, "Skicka ansökan", "Send application")}
              </Button>
            )
          )}
        </div>
      </div>

      {listing.tags && listing.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {listing.tags.map((tag) => {
            const label = getListingTagLabel(tag);
            return label ? (
              <Tag
                key={label}
                text={label}
                height={28}
                horizontalPadding={14}
                fontSize={13}
              />
            ) : null;
          })}
        </div>
      )}

      <div className="mt-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-100 pb-2">
          {localizedText(locale, "Om boendet", "About the home")}
        </h2>
        <ReadMoreComponent
          text={listing.description ?? ""}
          variant="large"
          className="mt-2"
          textClassName="text-[15px] leading-relaxed text-gray-700"
          buttonWrapClassName="pb-4"
          moreLabel={localizedText(locale, "Läs mer", "Read more")}
          lessLabel={localizedText(locale, "Visa mindre", "Show less")}
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
  hideStudentActions?: boolean;
  onFavoriteToggle?: (id: string, isFav: boolean) => void | Promise<void>;
};

export default function BostadAbout({
  listing,
  onApplyClick,
  applyDisabled,
  hasApplied,
  isEditable = false,
  isFavorite,
  hideStudentActions = false,
  onFavoriteToggle,
}: Props) {
  const { locale } = useI18n();
  const dwellingLabel = [
    listing.dwellingType ? formatDwellingType(listing.dwellingType, locale) : null,
    listing.rooms ? `${listing.rooms} ${localizedText(locale, "rum", "rooms")}` : null,
    listing.sizeM2 ? `${listing.sizeM2} m²` : null,
  ]
    .filter(Boolean)
    .join(" / ") || localizedText(locale, "Information saknas", "Information missing");

  const content = (
    <BostadAboutContent
      listing={listing}
      isFavorite={isFavorite}
      onApplyClick={onApplyClick}
      applyDisabled={applyDisabled}
      hasApplied={hasApplied}
      dwellingLabel={dwellingLabel}
      hideStudentActions={hideStudentActions}
      onFavoriteToggle={onFavoriteToggle}
    />
  );

  return (
    <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
      {isEditable ? (
        <EditWrapper
          isEditable={isEditable}
          tooltip={localizedText(locale, "Redigera annonstext", "Edit listing text")}
        >
          <BostadForm listing={listing}>
            <div>{content}</div>
          </BostadForm>
        </EditWrapper>
      ) : (
        content
      )}
    </section>
  );
}
