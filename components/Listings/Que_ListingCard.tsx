 "use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Check } from "lucide-react";
import Tag from "../ui/Tag";
import VerifiedTag from "../ui/VerifiedTag";
import type { Tag as TagType } from "@/types";

type QueueSummary = {
  name: string;
  area?: string | null;
  city?: string | null;
  totalUnits?: number | null;
  unitsLabel?: string;
  isVerified?: boolean;
  logoUrl?: string | null;
  logoAlt?: string;
  tags?: TagType[];
};

export type QueListingCardProps = QueueSummary & {
  isSelected?: boolean;
  isAlreadyJoined?: boolean;
  onViewListings?: () => void;
  onToggleSelect?: () => void;
};

const BASE_WIDTH = 360;
const MIN_SCALE = 0.7;
const MAX_SCALE = 1;
const BADGE_MIN_SCALE = 0.95;
const BADGE_MAX_SCALE = 1.25;

const Que_ListingCard: React.FC<QueListingCardProps> = (props) => {
  const {
    name,
    area,
    city,
    totalUnits,
    unitsLabel,
    isVerified = false,
    logoUrl,
    logoAlt,
    tags,
    isSelected = false,
    isAlreadyJoined = false,
    onViewListings,
    onToggleSelect,
  } = props;
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const updateScale = (width: number) => {
      const nextScale = Math.min(
        Math.max(width / BASE_WIDTH, MIN_SCALE),
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
  }, []);

  const unitsText = unitsLabel ?? (totalUnits ? `${totalUnits} bostäder` : undefined);

  const scaleValue = (value: number) => `${(value * scale).toFixed(2)}px`;

  const badgeScale = Math.min(
    Math.max(scale, BADGE_MIN_SCALE),
    BADGE_MAX_SCALE
  );

  const tagSize = {
    height: 26 * scale,
    horizontalPadding: 14 * scale,
    fontSize: 14 * scale,
    lineHeight: 20 * scale,
  };

  const safeTags = tags ?? [];
  const locationLabel = [area, city].filter(Boolean).join(", ");

  return (
    <div
      role="button"
      ref={cardRef}
      onKeyDown={e => {
        // Enable keyboard navigation
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onViewListings?.();
        }
      }}
      onClick={e => onViewListings?.()}
      onMouseEnter={e => setIsHovering(true)}
      onMouseLeave={e => setIsHovering(false)}
      className={`relative flex w-full max-w-[320px] flex-col cursor-pointer group
        shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100
        ${isSelected ? "bg-green-50/60" : "bg-white"}`}
      style={{
        padding: scaleValue(20),
        borderRadius: scaleValue(20),
        gap: scaleValue(16),
        minHeight: scaleValue(340),
        transform: isHovering ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* Logo — large, centered, hero element */}
      <div
        className="flex items-center justify-center shrink-0 self-center"
        style={{
          width: "100%",
          minHeight: scaleValue(80),
          flexGrow: 1,
          padding: scaleValue(4),
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={logoAlt ?? name}
            className="object-contain"
            style={{
              maxWidth: "100%",
              maxHeight: scaleValue(180),
              borderRadius: scaleValue(6),
            }}
          />
        ) : (
          <Building2 size={48 * scale} className="text-gray-400" />
        )}
      </div>

      {/* Text content — left-aligned, grows to fill space */}
      <div className="flex flex-col" style={{ gap: scaleValue(6) }}>
        {/* Verified badge */}
        {isVerified && (
          <div
            style={{
              transform: `scale(${badgeScale})`,
              transformOrigin: "left center",
            }}
          >
            <VerifiedTag />
          </div>
        )}

        {/* Name — left-aligned, clamp to 2 lines */}
        <h3
          className="font-bold text-gray-900"
          style={{
            fontSize: scaleValue(20),
            lineHeight: scaleValue(26),
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {name}
        </h3>

        {/* Location + units on one row */}
        <div
          className="flex items-center flex-wrap text-gray-500"
          style={{
            gap: scaleValue(6),
            fontSize: scaleValue(15),
            lineHeight: scaleValue(20),
          }}
        >
          {locationLabel && (
            <div className="flex items-center" style={{ gap: scaleValue(4) }}>
              <MapPin size={13 * scale} strokeWidth={1.8} className="shrink-0" />
              <span>{locationLabel}</span>
            </div>
          )}
          {locationLabel && unitsText && (
            <span className="text-gray-300">{"\u00b7"}</span>
          )}
          {unitsText && (
            <div className="flex items-center" style={{ gap: scaleValue(4) }}>
              <Building2 size={13 * scale} strokeWidth={1.8} className="shrink-0" />
              <span>{unitsText}</span>
            </div>
          )}
        </div>
      </div>

      {/* TAGS */}
      {safeTags.length > 0 && (
        <div
          className="flex flex-wrap"
          style={{
            gap: scaleValue(6),
            minHeight: scaleValue(28),
          }}
        >
          {safeTags.map((tag) => (
            <Tag
              key={tag}
              text={tag}
              height={tagSize.height}
              horizontalPadding={tagSize.horizontalPadding}
              fontSize={tagSize.fontSize}
              lineHeight={tagSize.lineHeight}
            />
          ))}
        </div>
      )}

      {/* Select button */}
      <div className="flex">
        <Button
          type="button"
          onClick={e => {
            e.stopPropagation();
            if (isAlreadyJoined) return;
            onToggleSelect?.();
          }}
          size="xs"
          variant={isSelected ? "default" : "secondary"}
          isDisabled={isAlreadyJoined}
          className={`w-full text-xs transition-colors duration-150 ${
            isAlreadyJoined
              ? "border-gray-200 bg-gray-100 text-gray-500 shadow-none"
              : ""
          }`}
        >
          {isAlreadyJoined
            ? "Du står redan i kön"
            : isSelected
              ? "Ta bort"
              : "Lägg till"}
        </Button>
      </div>

      {/* Selection checkmark — top-left to avoid logo */}
      <div
        className={`absolute top-3 left-3 flex items-center justify-center rounded-full transition-all duration-200
          ${isSelected
            ? "bg-green-500 text-white scale-100 opacity-100"
            : "bg-gray-100 text-transparent scale-75 opacity-0 group-hover:opacity-40 group-hover:scale-100"}`}
        style={{
          width: scaleValue(26),
          height: scaleValue(26),
        }}
      >
        <Check size={14 * scale} strokeWidth={2.5} />
      </div>
    </div>
  );
};

export default Que_ListingCard;
