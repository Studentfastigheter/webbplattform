"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/button";
import { MapPin, Building2 } from "lucide-react";
import Tag from "../ui/Tag";
import VerifiedTag from "../ui/VerifiedTag";

export type QueListingCardProps = {
  name: string;
  area: string;
  city: string;
  totalUnits?: number;
  unitsLabel?: string;
  isVerified?: boolean;
  logoUrl: string;
  logoAlt?: string;
  tags?: string[];
  onViewListings?: () => void;
  onReadMore?: () => void;
};

const BASE_WIDTH = 480;
const MIN_SCALE = 0.75;
const MAX_SCALE = 1;
const BADGE_MIN_SCALE = 0.8;
const BADGE_MAX_SCALE = 1;
const BUTTON_MIN_SCALE = 0.7;
const BUTTON_MAX_SCALE = 0.95;
const BADGE_BASE_HEIGHT = 26; // px, ungefär höjden på VerifiedTag

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
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

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

  const unitsText =
    unitsLabel ?? (totalUnits ? `${totalUnits} bostäder` : undefined);

  const scaleValue = (value: number) => `${(value * scale).toFixed(2)}px`;

  const badgeScale = Math.min(
    Math.max(scale, BADGE_MIN_SCALE),
    BADGE_MAX_SCALE
  );

  const buttonScale = Math.min(
    Math.max(scale, BUTTON_MIN_SCALE),
    BUTTON_MAX_SCALE
  );

  const buttonFont = 13 * buttonScale;
  const buttonPadding = 8 * buttonScale;

  const tagSize = {
    height: 26 * scale,
    horizontalPadding: 14 * scale,
    fontSize: 14 * scale,
    lineHeight: 20 * scale,
  };

  const badgeContainerHeight = BADGE_BASE_HEIGHT * badgeScale;

  return (
    <div
      ref={cardRef}
      className="flex w-full max-w-[520px] flex-col bg-white shadow-md"
      style={{
        padding: scaleValue(20),
        borderRadius: scaleValue(28),
        gap: scaleValue(16),
      }}
    >
      {/* TOP: badge + namn + plats + logo */}
      <div
        className="flex items-start justify-between"
        style={{ gap: scaleValue(16) }}
      >
        {/* Vänsterkolumn */}
        <div className="flex flex-col items-start min-w-0">
          {/* FIX: reservera alltid plats för badgen */}
          <div
            style={{
              height: `${badgeContainerHeight}px`,
              marginBottom: scaleValue(8),
              display: "flex",
              alignItems: "flex-start",
            }}
            aria-hidden={!isVerified}
          >
            {isVerified && (
              <div
                style={{
                  transform: `scale(${badgeScale})`,
                  transformOrigin: "top left",
                }}
              >
                <VerifiedTag />
              </div>
            )}
          </div>

          <h3
            className="font-semibold break-words"
            style={{
              fontSize: scaleValue(18),
              lineHeight: scaleValue(22),
              minHeight: scaleValue(44),
            }}
          >
            {name}
          </h3>

          {/* Location + units */}
          <div
            className="text-black"
            style={{
              marginTop: scaleValue(8),
              display: "grid",
              rowGap: scaleValue(4),
              fontSize: scaleValue(14),
              lineHeight: scaleValue(18),
            }}
          >
            <div
              className="flex items-center"
              style={{ gap: scaleValue(8) }}
            >
              <MapPin
                size={14 * scale}
                strokeWidth={1.8}
                className="shrink-0"
              />
              <span className="truncate">
                {area}, {city}
              </span>
            </div>

            {unitsText && (
              <div
                className="flex items-center"
                style={{ gap: scaleValue(8) }}
              >
                <Building2
                  size={14 * scale}
                  strokeWidth={1.8}
                  className="shrink-0"
                />
                <span className="truncate">{unitsText}</span>
              </div>
            )}
          </div>
        </div>

        {/* Logo till höger */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: scaleValue(96),
            height: scaleValue(96),
          }}
        >
          <img
            src={logoUrl}
            alt={logoAlt ?? name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>

      {/* TAGGAR */}
      {tags.length > 0 && (
        <div
          className="flex flex-wrap"
          style={{
            gap: scaleValue(8),
            paddingTop: scaleValue(8),
            minHeight: scaleValue(30),
          }}
        >
          {tags.map((tag) => (
            <Tag
              key={tag}
              text={tag}
              bgColor="#F0F0F0"
              textColor="black"
              height={tagSize.height}
              horizontalPadding={tagSize.horizontalPadding}
              fontSize={tagSize.fontSize}
              lineHeight={tagSize.lineHeight}
            />
          ))}
        </div>
      )}

      {/* KNAPPAR */}
      <div
        className="flex"
        style={{ gap: scaleValue(12), marginTop: scaleValue(6) }}
      >
        <Button
          type="button"
          onClick={onViewListings}
          size="sm"
          className="flex-1 rounded-full bg-[#E0E0E0]"
          style={{
            paddingBlock: `${buttonPadding}px`,
            fontSize: `${buttonFont}px`,
            lineHeight: `${buttonFont + 4}px`,
          }}
        >
          Visa bostäder
        </Button>

        <Button
          type="button"
          onClick={onReadMore}
          size="sm"
          className="flex-1 rounded-full bg-[#0F4D0F] text-white"
          style={{
            paddingBlock: `${buttonPadding}px`,
            fontSize: `${buttonFont}px`,
            lineHeight: `${buttonFont + 4}px`,
          }}
        >
          Läs mer
        </Button>
      </div>
    </div>
  );
};

export default Que_ListingCard;
