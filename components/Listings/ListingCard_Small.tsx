"use client";

import React, { useEffect, useRef, useState } from "react";
import Tag from "../ui/Tag";
import VerifiedTag from "../ui/VerifiedTag";

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
  isVerified?: boolean;
  
  // Funktioner & UI
  onClick?: () => void;
  onHoverChange?: (hovering: boolean) => void;
  variant?: "default" | "compact";
};

const BASE_WIDTH = 380;
const CARD_MIN_WIDTH = 280;
const COMPACT_CARD_MIN_WIDTH = 260;
const IMAGE_BASE_HEIGHT = 220;
const IMAGE_COMPACT_HEIGHT = 180;
const MIN_SCALE = 0.55;
const MAX_SCALE = 1;
const BADGE_MIN_SCALE = 0.8;
const BADGE_MAX_SCALE = 1;

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
    isVerified = false,
    imageUrl,
    tags,
    onClick,
    onHoverChange,
    variant = "default",
  } = props;

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const baseWidth = variant === "compact" ? 320 : BASE_WIDTH;
  const maxWidth = variant === "compact" ? 360 : 480;
  const imageBaseHeight =
    variant === "compact" ? IMAGE_COMPACT_HEIGHT : IMAGE_BASE_HEIGHT;

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
    height: 26 * scale,
    horizontalPadding: 14 * scale,
    fontSize: 14 * scale,
    lineHeight: 20 * scale,
  };
  const badgeScale = Math.min(
    Math.max(scale, BADGE_MIN_SCALE),
    BADGE_MAX_SCALE
  );

  const safeTags = tags ?? [];

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
        gap: scaleValue(16),
        padding: scaleValue(16),
        borderRadius: scaleValue(32),
      }}
    >
      {/* IMAGE */}
      <div
        className="w-full bg-gray-100"
        style={{
          borderRadius: scaleValue(28),
          height: scaleValue(imageBaseHeight),
        }}
      >
        <div className="h-full w-full">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
              <span style={{ fontSize: scaleValue(14) }}>Ingen bild</span>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div
        className="px-1 pb-1"
        style={{
          display: "grid",
          rowGap: scaleValue(12),
        }}
      >
        {/* Title + Badge */}
        <div
          className="flex items-start justify-between"
          style={{ gap: scaleValue(16) }}
        >
          <h3
            className="font-bold text-gray-900"
            style={{
              fontSize: scaleValue(18),
              lineHeight: scaleValue(22),
              minHeight: scaleValue(44), // reserve two lines
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </h3>

          {isVerified && (
            <div
              style={{
                transform: `scale(${badgeScale})`,
                transformOrigin: "top right",
                flexShrink: 0,
              }}
            >
              <VerifiedTag />
            </div>
          )}
        </div>

        {/* Location + Size */}
        <div
          className="flex items-start justify-between"
          style={{ gap: scaleValue(16), fontSize: scaleValue(14) }}
        >
          <div
            className="min-w-0 text-gray-700"
            style={{
              display: "grid",
              rowGap: scaleValue(4),
              minHeight: scaleValue(44),
            }}
          >
            <p className="truncate font-medium" title={[area, city].filter(Boolean).join(", ")}>
              {[area, city].filter(Boolean).join(", ")}
            </p>
            <p
              className="truncate text-gray-500"
              title={`${dwellingType ?? "-"} \u00b7 ${rooms ?? "-"} rum \u00b7 ${sizeM2 ?? "-"} m\u00b2`}
            >
              {dwellingType ?? "-"} {"\u00b7"} {rooms ?? "-"} rum {"\u00b7"} {sizeM2 ?? "-"} m{"\u00b2"}
            </p>
          </div>

          <div
            className="flex min-w-[170px] max-w-[52%] flex-col items-end text-right text-black"
            style={{ rowGap: scaleValue(4) }}
          >
            <p
              className="font-bold text-gray-900"
              style={{
                fontSize: scaleValue(18),
                lineHeight: scaleValue(22),
                whiteSpace: "nowrap",
              }}
            >
              {formatRent(rent)}
            </p>
            <p
              className="truncate text-gray-500"
              style={{
                fontSize: scaleValue(14),
                lineHeight: scaleValue(18),
                maxWidth: "100%",
              }}
              title={landlordType}
            >
              {landlordType}
            </p>
          </div>
        </div>
        
        {safeTags.length > 0 && (
          <div
            className="flex flex-wrap pt-0"
            style={{
              gap: scaleValue(8),
              minHeight: scaleValue(30),
            }}
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
      </div>
    </div>
  );
};

export default ListingCardSmall;