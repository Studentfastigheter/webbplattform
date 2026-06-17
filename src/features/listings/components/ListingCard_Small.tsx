"use client";

import React, { useEffect, useRef, useState } from "react";
import CompanyLogo from "@/components/shared/CompanyLogo";
import Tag from "@/components/ui/Tag";
import { Heart } from "@/components/icons";
import { getAppIconElement } from "@/components/icons/catalog";
import { useAuth } from "@/context/AuthContext";
import { canUseFavorites } from "@/features/listings/hooks/useListings";
import type { ListingTagDTO } from "@/types/listing";
import { useI18n } from "@/i18n/I18nProvider";
import { formatLocalizedCurrency, localizedText } from "@/i18n/text";

// ÄNDRING: Vi definierar props manuellt istället för att ärva från gamla ListingWithRelations
export type ListingCardSmallProps = {
  title: string;
  area: string;
  city: string;
  dwellingType: string;
  rooms: number;
  sizeM2: number;
  rent: number;
  tags?: Array<string | ListingTagDTO>;
  imageUrl?: string;      // En enkel sträng nu (URL)
  landlordType?: string;  // Motsvarar hostType ("Privat värd" / "Företag")
  hostName?: string;
  hostLogoUrl?: string;
  isVerified?: boolean;
  
  // NEW: Favoritfunktion (hjärta)
  id?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
  
  // Funktioner & UI
  onClick?: () => void;
  onHoverChange?: (hovering: boolean) => void;
  variant?: "default" | "compact";
  footerContent?: React.ReactNode;
  showFavoriteButton?: boolean;
  imageOverlayContent?: React.ReactNode;
  imageTopRightContent?: React.ReactNode;
  showHostLogo?: boolean;
  contentTopRightContent?: React.ReactNode;
  reserveTagSpace?: boolean;
};

const BASE_WIDTH = 470;
const COMPACT_BASE_WIDTH = 360;
const IMAGE_ASPECT_RATIO = "16 / 10";
const MIN_SCALE = 0.86;
const MAX_SCALE = 1;

const formatRent = (rent: number | null | undefined, locale: "sv" | "en") =>
  typeof rent === "number" ? formatLocalizedCurrency(locale, rent) : "-";

const getTagLabel = (tag: string | ListingTagDTO) =>
  typeof tag === "string" ? tag : tag.displayName || tag.tagKey || "";

const getTagIconName = (tag: string | ListingTagDTO) =>
  typeof tag === "string" ? tag : tag.icon || tag.tagKey || tag.displayName;

const ListingCardSmall: React.FC<ListingCardSmallProps> = (props) => {
  const {
    title,
    area,
    city,
    dwellingType,
    rooms,
    sizeM2,
    rent,
    landlordType,
    hostName,
    hostLogoUrl,
    id,
    isFavorite,
    onFavoriteToggle,
    imageUrl,
    tags,
    onClick,
    onHoverChange,
    variant = "default",
    footerContent,
    showFavoriteButton = true,
    imageOverlayContent,
    imageTopRightContent,
    showHostLogo = true,
    contentTopRightContent,
    reserveTagSpace = true,
  } = props;

  const { user } = useAuth();
  const { locale } = useI18n();

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [isLiked, setIsLiked] = useState(isFavorite || false);
  
  useEffect(() => {
    if (isFavorite !== undefined) {
      setIsLiked(isFavorite);
    }
  }, [isFavorite]);
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLikedState = !isLiked;
    if (!user && id && onFavoriteToggle) {
      onFavoriteToggle(id, newLikedState);
      return;
    }

    setIsLiked(newLikedState);
    if (id && onFavoriteToggle) {
      onFavoriteToggle(id, newLikedState);
    }
  };

  const baseWidth = variant === "compact" ? COMPACT_BASE_WIDTH : BASE_WIDTH;
  const maxWidth = variant === "compact" ? 360 : BASE_WIDTH;

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const updateScale = (width: number) => {
      const nextScale = Math.min(
        Math.max(width / baseWidth, MIN_SCALE),
        MAX_SCALE
      );
      setScale(Number(nextScale.toFixed(3)));
    };

    updateScale(node.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        updateScale(entry.contentRect.width);
      });
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, [baseWidth]);

  const scaleValue = (value: number) => `${(value * scale).toFixed(2)}px`;
  const isCompact = variant === "compact";
  const tagSize = {
    height: (isCompact ? 19 : 20) * scale,
    horizontalPadding: (isCompact ? 8 : 10) * scale,
    fontSize: (isCompact ? 9.25 : 10) * scale,
    lineHeight: (isCompact ? 11.5 : 12) * scale,
  };
  const safeTags = (tags ?? [])
    .map((tag) => {
      const label = getTagLabel(tag);
      return label ? { label, iconName: getTagIconName(tag) } : null;
    })
    .filter((tag): tag is { label: string; iconName: string } => tag !== null);
  const locationText =
    [area, city].filter(Boolean).join(", ") ||
    localizedText(locale, "Ej angivet", "Not specified");
  const detailsText = `${dwellingType ?? "-"} \u00b7 ${rooms ?? "-"} ${localizedText(locale, "rum", "rooms")} \u00b7 ${sizeM2 ?? "-"} m\u00b2`;
  const shouldShowHostLogo = showHostLogo && Boolean(hostLogoUrl);
  const logoSize = variant === "compact" ? 60 : 76;
  const contentPadding = isCompact ? 12 : 14;
  const logoRightOffset = shouldShowHostLogo ? 14 : 0;
  const hasContentTopRight = Boolean(contentTopRightContent);
  const contentRightPadding = shouldShowHostLogo
    ? logoRightOffset + logoSize + 14
    : hasContentTopRight
      ? contentPadding + 96
      : contentPadding;
  const logoAlt = hostName || landlordType
    ? `${hostName ?? landlordType} ${localizedText(locale, "logotyp", "logo")}`
    : localizedText(locale, "Hyresvärdens logotyp", "Landlord logo");
  const showStudentFavoriteButton = showFavoriteButton && canUseFavorites(user);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      className="group flex w-full cursor-pointer flex-col border border-black/[0.08] bg-white shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition-shadow duration-200 hover:shadow-[0_12px_26px_rgba(15,23,42,0.12)]"
      style={{
        maxWidth,
        minWidth: 0,
        borderRadius: scaleValue(28),
        overflow: "hidden"
      }}
    >
      {/* IMAGE */}
      <div
        className="w-full bg-gray-100 overflow-hidden relative shrink-0 group/image"
        style={{
          aspectRatio: IMAGE_ASPECT_RATIO,
          lineHeight: 0,
          minHeight: 0,
        }}
      >
        {imageTopRightContent && (
          <div className="absolute right-3 top-3 z-10">{imageTopRightContent}</div>
        )}

        {imageOverlayContent && (
          <div className="pointer-events-none absolute inset-0 z-20">
            {imageOverlayContent}
          </div>
        )}

        {showStudentFavoriteButton && (
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="absolute right-3 top-3 z-10 rounded-full bg-white/95 p-2.5 shadow-sm backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
            aria-label={
              isLiked
                ? localizedText(locale, "Ta bort från sparade", "Remove from saved")
                : localizedText(locale, "Spara bostad", "Save home")
            }
          >
            <Heart className={`h-5 w-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </button>
        )}

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 block h-full w-full object-cover object-center transition-transform duration-500"
            style={{
              minWidth: "100%",
              minHeight: "100%",
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <span
              style={{
                fontSize: scaleValue(14),
                lineHeight: scaleValue(18),
              }}
            >
              {localizedText(locale, "Ingen bild", "No image")}
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          padding: scaleValue(contentPadding),
          paddingRight: scaleValue(contentRightPadding),
          gap: scaleValue(isCompact ? 7 : 8),
        }}
      >
        {contentTopRightContent && (
          <div
            className="absolute z-[1]"
            style={{
              top: scaleValue(contentPadding),
              right: scaleValue(contentPadding),
            }}
          >
            {contentTopRightContent}
          </div>
        )}

        {shouldShowHostLogo && (
          <div
            className="absolute top-1/2 flex items-center justify-center"
            style={{
              right: scaleValue(logoRightOffset),
              width: scaleValue(logoSize),
              height: scaleValue(logoSize),
              borderRadius: scaleValue(6),
              overflow: "hidden",
              transform: "translateY(-50%)",
            }}
          >
            <CompanyLogo
              src={hostLogoUrl}
              alt={logoAlt}
              name={hostName ?? landlordType}
              className="h-full w-full bg-white ring-1 ring-black/5"
              imageClassName="p-0"
              style={{ borderRadius: scaleValue(6) }}
            />
          </div>
        )}

        {/* Listing facts + host logo */}
        <div
          className="min-w-0 overflow-hidden"
        >
          <div
            className="min-w-0"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: scaleValue(isCompact ? 2 : 3),
            }}
          >
            <p
              className="font-semibold text-[#6f6f6f]"
              style={{
                fontSize: scaleValue(isCompact ? 11 : 11.5),
                lineHeight: scaleValue(isCompact ? 14 : 15),
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                wordBreak: "break-word",
              }}
            >
              {locationText}
            </p>

            <h3
              className="font-normal text-[#111111]"
              style={{
                fontSize: scaleValue(isCompact ? 15.5 : 17),
                lineHeight: scaleValue(isCompact ? 20 : 22),
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                wordBreak: "break-word",
              }}
            >
              {title}
            </h3>

            <p
              className="font-normal text-[#202020]"
              style={{
                marginTop: scaleValue(isCompact ? 1 : 2),
                fontSize: scaleValue(isCompact ? 14 : 15),
                lineHeight: scaleValue(isCompact ? 18 : 20),
              }}
            >
              {formatRent(rent, locale)}
            </p>

            <p
              className="font-normal text-[#6f6f6f]"
              style={{
                fontSize: scaleValue(isCompact ? 11 : 12),
                lineHeight: scaleValue(isCompact ? 14 : 16),
                wordBreak: "break-word",
              }}
            >
              {detailsText}
            </p>
          </div>
        </div>

        {safeTags.length > 0 && (
          <div
            className="flex min-w-0 flex-nowrap overflow-x-hidden overflow-y-visible"
            style={{
              alignItems: "center",
              gap: scaleValue(6),
              minHeight: scaleValue(tagSize.height),
            }}
          >
            {safeTags.slice(0, 3).map((tag) => (
              <Tag
                key={tag.label}
                text={tag.label}
                height={tagSize.height}
                horizontalPadding={tagSize.horizontalPadding}
                fontSize={tagSize.fontSize}
                lineHeight={tagSize.lineHeight}
                fontWeight={700}
                icon={getAppIconElement(tag.iconName, "h-[1em] w-[1em]")}
                bgColor="#f7f7f7"
                textColor="#6f6f6f"
                borderColor="#d7d7d7"
                className="min-w-0"
              />
            ))}
          </div>
        )}

        {reserveTagSpace && safeTags.length === 0 && (
          <div
            aria-hidden="true"
            style={{
              height: scaleValue(tagSize.height),
            }}
          />
        )}

        {footerContent && (
          <div
            className="border-t border-gray-200 pt-2"
            style={{ marginTop: scaleValue(2) }}
          >
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingCardSmall;
