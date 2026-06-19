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
import { Check, Heart, Home, MapPin, Share2 } from "@/components/icons";
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

  const dateFacts = (listing.availableFrom || listing.availableTo || listing.moveIn || listing.applyBy) ? (
    <div className="grid gap-x-3 gap-y-3 min-[360px]:grid-cols-2 xl:grid-cols-4">
      {dateItems.map((item) => (
        <div
          key={item.label}
          className="flex min-w-0 flex-col border-l border-gray-200 pl-2.5 sm:pl-3"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 sm:text-xs">
            {item.label}
          </span>
          <span className="mt-1 break-words text-[13px] font-semibold text-gray-900 sm:text-sm">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  ) : null;

  const renderActionIcons = (placement: "mobile" | "desktop" = "desktop") => {
    if (hideStudentActions) return null;

    const isMobile = placement === "mobile";
    const iconClassName = isMobile ? "h-4 w-4" : "h-[18px] w-[18px]";

    return (
      <div className={cn("flex items-center justify-end", isMobile ? "gap-1" : "gap-1.5")}>
        {canFavorite && (
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={isLoadingFav}
            className={cn(
              "inline-flex items-center justify-center rounded-full transition-colors",
              isMobile ? "h-8 w-8 border border-gray-100 bg-white shadow-sm" : "h-9 w-9",
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
            <Heart className={cn(iconClassName, isFav && "fill-current")} />
          </button>
        )}
        {canFavorite && <div className={cn("w-px bg-gray-200", isMobile ? "h-4" : "h-5")} />}
        <ShareDialog>
          <button
            type="button"
            aria-label={localizedText(locale, "Dela bostad", "Share listing")}
            className={cn(
              "inline-flex items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600",
              isMobile ? "h-8 w-8 border border-gray-100 bg-white shadow-sm" : "h-9 w-9",
            )}
          >
            <Share2 className={iconClassName} />
          </button>
        </ShareDialog>
      </div>
    );
  };

  const renderRentSummary = (placement: "mobile" | "desktop" = "desktop") => {
    const isMobile = placement === "mobile";

    return (
      <div className={cn("flex flex-col items-start lg:items-end", isMobile ? "gap-0" : "gap-0.5")}>
        <span
          className={cn(
            "font-medium uppercase tracking-wider text-gray-400",
            isMobile ? "text-[10px]" : "text-[11px] sm:text-xs",
          )}
        >
          {localizedText(locale, "Månadshyra", "Monthly rent")}
        </span>
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span
            className={cn(
              "font-bold leading-none tracking-tight text-gray-900",
              isMobile
                ? "text-[25px] min-[390px]:text-[26px]"
                : "text-[26px] sm:text-3xl lg:text-2xl",
            )}
          >
            {rentValue}
          </span>
          {isRentNumber && (
            <span className={cn("font-medium text-gray-400", isMobile ? "text-[13px]" : "text-sm")}>
              {localizedText(locale, "kr/mån", "SEK/mo")}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderApplicationAction = (placement: "mobile" | "desktop" = "desktop") => {
    if (hideStudentActions) return null;

    const actionSizeClass =
      placement === "mobile"
        ? "h-10 w-fit min-w-[144px] px-4 min-[390px]:min-w-[156px] min-[390px]:px-5"
        : "h-11 w-full px-6 lg:w-fit lg:px-8";
    const actionTextClass =
      placement === "mobile" ? "text-[13px] min-[390px]:text-[14px]" : "text-[14px]";

    return hasApplied ? (
      <div
        className={cn(
          "flex items-center justify-center gap-2",
          actionSizeClass,
          "rounded-full",
          "bg-green-100 text-green-800",
          actionTextClass,
          "font-medium",
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
          "flex items-center justify-center gap-2",
          actionSizeClass,
          "rounded-full",
          "bg-[#004225] text-white",
          actionTextClass,
          "font-medium",
          "shadow-sm hover:shadow-md transition-all",
          "hover:bg-[#00331b] active:scale-[0.98]",
        )}
      >
        {localizedText(locale, "Skicka ansökan", "Send application")}
      </Button>
    );
  };

  const renderTags = (placement: "mobile" | "desktop" = "desktop") => {
    if (!listing.tags || listing.tags.length === 0) return null;

    const isMobile = placement === "mobile";

    return (
      <div className={cn("flex flex-wrap items-center", isMobile ? "gap-1.5 lg:hidden" : "hidden gap-2 lg:flex")}>
        {listing.tags.map((tag) => {
          const label = getListingTagLabel(tag);
          return label ? (
            <Tag
              key={label}
              text={label}
              height={isMobile ? 26 : 28}
              horizontalPadding={isMobile ? 12 : 14}
              fontSize={isMobile ? 12 : 13}
            />
          ) : null;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="flex min-w-0 flex-col gap-3.5 sm:gap-4 lg:flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-2">
              <h1 className="text-balance text-[24px] font-bold leading-tight tracking-tight text-gray-900 min-[390px]:text-[25px] sm:text-3xl lg:text-4xl">
                {listing.title}
              </h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] leading-5 text-gray-600 sm:mt-1 sm:text-sm">
                <span className="flex min-w-0 items-center gap-1.5 font-medium">
                  <MapPin className="h-4 w-4 text-green-700" />
                  <span className="min-w-0 break-words">
                    {listing.fullAddress
                      ? `${listing.fullAddress}, ${listing.city}`
                      : [listing.area, listing.city].filter(Boolean).join(", ")}
                  </span>
                </span>
                <span className="flex min-w-0 items-center gap-1.5 font-medium">
                  <Home className="h-4 w-4 text-green-700" />
                  <span className="min-w-0 break-words">{dwellingLabel}</span>
                </span>
              </div>
            </div>

            <div className="-mr-1 shrink-0 pt-0.5 lg:hidden">
              {renderActionIcons("mobile")}
            </div>
          </div>

          {renderTags("mobile")}

          <div className="grid gap-3 pt-0.5 min-[360px]:grid-cols-[minmax(0,1fr)_auto] min-[360px]:items-center lg:hidden">
            {renderRentSummary("mobile")}
            {renderApplicationAction("mobile")}
          </div>

          {dateFacts}
        </div>

        <div className="hidden w-full shrink-0 flex-col items-stretch gap-4 lg:flex lg:w-auto lg:min-w-[244px] lg:items-end">
          {renderActionIcons()}
          {renderRentSummary()}
          {renderApplicationAction()}
        </div>
      </div>

      {renderTags()}

      <div className="mt-1 sm:mt-2">
        <h2 className="mb-2 border-b border-gray-100 pb-2 text-[17px] font-semibold text-gray-900 sm:text-lg">
          {localizedText(locale, "Om boendet", "About the home")}
        </h2>
        <ReadMoreComponent
          text={listing.description ?? ""}
          variant="large"
          className="mt-2"
          collapsedLinesLarge={5}
          textClassName="text-[14px] leading-6 text-gray-700 sm:text-[15px] sm:leading-relaxed"
          buttonWrapClassName="pb-3 sm:pb-4"
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
    <section className="rounded-[20px] border border-black/5 bg-white/80 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.05)] sm:rounded-3xl sm:p-6">
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
