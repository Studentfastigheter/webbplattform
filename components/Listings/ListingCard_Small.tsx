"use client";

import React, { useEffect, useRef, useState } from "react";
import Tag from "../ui/Tag";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ÄNDRING: Vi definierar props manuellt istället för att ärva från gamla ListingWithRelations
export type ListingCardSmallProps = {
  title: string;
  area: string;
  city: string;
  dwellingType: string;
  rooms: number;
  sizeM2: number;
  rent: number;
  tags?: string[];
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
  imageTopRightContent?: React.ReactNode;
  showHostLogo?: boolean;
  contentTopRightContent?: React.ReactNode;
};

const BASE_WIDTH = 380;
const CARD_MIN_WIDTH = 280;
const COMPACT_CARD_MIN_WIDTH = 260;
const IMAGE_ASPECT_RATIO = "16 / 10";
const MIN_SCALE = 0.55;
const MAX_SCALE = 1;

const formatRent = (rent?: number | null) =>
  typeof rent === "number"
    ? `${rent.toLocaleString("sv-SE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })} kr/mån`
    : "-";

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
    imageTopRightContent,
    showHostLogo = true,
    contentTopRightContent,
  } = props;

  const { user } = useAuth();

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
    setIsLiked(newLikedState);
    if (id && onFavoriteToggle) {
      onFavoriteToggle(id, newLikedState);
    }
  };

  const baseWidth = variant === "compact" ? 320 : BASE_WIDTH;
  const maxWidth = variant === "compact" ? 360 : 480;

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
  const tagSize = {
    height: 24 * scale,
    horizontalPadding: 12 * scale,
    fontSize: 13 * scale,
    lineHeight: 18 * scale,
  };

  const safeTags = tags ?? [];
  const locationText = [area, city].filter(Boolean).join(", ") || "Ej angivet";
  const detailsText = `${dwellingType ?? "-"} \u00b7 ${rooms ?? "-"} rum \u00b7 ${sizeM2 ?? "-"} m\u00b2`;
  const logoSize = variant === "compact" ? 50 : 64;
  const contentPadding = 13;
  const logoRightOffset = showHostLogo ? 16 : 0;
  const hasContentTopRight = Boolean(contentTopRightContent);
  const contentRightPadding = showHostLogo
    ? logoRightOffset + logoSize + 14
    : hasContentTopRight
      ? contentPadding + 96
      : contentPadding;
  const logoAlt = hostName || landlordType
    ? `${hostName ?? landlordType} logotyp`
    : "Hyresvardens logotyp";

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      className="flex w-full flex-col bg-white shadow-md cursor-pointer group hover:shadow-lg transition-shadow duration-200"
      style={{
        maxWidth,
        minWidth: variant === "compact" ? COMPACT_CARD_MIN_WIDTH : CARD_MIN_WIDTH,
        borderRadius: scaleValue(32),
        overflow: "hidden"
      }}
    >
      {/* IMAGE */}
      <div
        className="w-full bg-gray-100 overflow-hidden relative shrink-0 group/image"
        style={{
          aspectRatio: IMAGE_ASPECT_RATIO,
          lineHeight: 0,
        }}
      >
        {imageTopRightContent && (
          <div className="absolute right-3 top-3 z-10">{imageTopRightContent}</div>
        )}

        {/* Favorite Button (Only visible if logged in and enabled) */}
        {user && showFavoriteButton && (
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-sm hover:scale-110 active:scale-95 transition-all shadow-sm"
            aria-label={isLiked ? "Ta bort från sparade" : "Spara bostad"}
          >
            <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
        )}

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 block h-full w-full object-cover object-center transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <span
              style={{
                fontSize: scaleValue(14),
                lineHeight: scaleValue(18),
              }}
            >
              Ingen bild
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div
        className="relative flex flex-col"
        style={{
          padding: scaleValue(contentPadding),
          paddingRight: scaleValue(contentRightPadding),
          gap: scaleValue(8),
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

        {showHostLogo && (
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
            <img
              src={hostLogoUrl || "/campuslyan-logo.svg"}
              alt={logoAlt}
              className="block h-full w-full"
              style={{
                borderRadius: scaleValue(6),
                objectFit: "contain",
              }}
            />
          </div>
        )}

        {/* Listing facts + host logo */}
        <div
          className="min-w-0"
        >
          <div
            className="min-w-0"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: scaleValue(3),
            }}
          >
            <p
              className="text-gray-500"
              style={{
                fontSize: scaleValue(11.5),
                lineHeight: scaleValue(15),
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
              className="font-medium text-gray-900"
              style={{
                fontSize: scaleValue(17),
                lineHeight: scaleValue(22),
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
              className="font-medium text-gray-900"
              style={{
                marginTop: scaleValue(3),
                fontSize: scaleValue(14.5),
                lineHeight: scaleValue(19),
              }}
            >
              {formatRent(rent)}
            </p>

            <p
              className="text-gray-500"
              style={{
                fontSize: scaleValue(12),
                lineHeight: scaleValue(16),
                wordBreak: "break-word",
              }}
            >
              {detailsText}
            </p>
          </div>
        </div>

        {safeTags.length > 0 && (
          <div
            className="flex flex-wrap"
            style={{ gap: scaleValue(6) }}
          >
            {safeTags.slice(0, 3).map((tag) => (
              <Tag
                key={tag}
                text={tag}
                bgColor="#F3F4F6"
                textColor="#374151"
                height={tagSize.height}
                horizontalPadding={tagSize.horizontalPadding}
                fontSize={tagSize.fontSize}
                lineHeight={tagSize.lineHeight}
              />
            ))}
          </div>
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
