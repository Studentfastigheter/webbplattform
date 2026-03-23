"use client";

import React from "react";
import { ListingCardDTO } from "@/types/listing";

type ListingMapPopupProps = {
  listing: ListingCardDTO;
  onOpen?: (id: string) => void;
};

const formatRent = (rent?: number | null) =>
  typeof rent === "number"
    ? `${new Intl.NumberFormat("sv-SE", {
        maximumFractionDigits: 0,
      }).format(rent)} kr/mån`
    : null;

const ListingMapPopup: React.FC<ListingMapPopupProps> = ({
  listing,
  onOpen,
}) => {
  const formattedRent = formatRent(listing.rent);
  const thumbnailUrl = listing.imageUrl;
  const neighbourhood =
    listing.location.split(",")[0]?.trim() || listing.location;

  const handleOpen = () => onOpen?.(listing.id);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpen();
    }
  };

  /* ---- Details chips ---- */
  const details = [
    listing.rooms ? `${listing.rooms} rum` : null,
    listing.sizeM2 ? `${listing.sizeM2} m²` : null,
    listing.dwellingType || null,
  ].filter(Boolean);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className="
        group w-[240px] overflow-hidden rounded-xl bg-white
        shadow-[0_2px_12px_rgba(0,0,0,.12)]
        cursor-pointer transition-shadow duration-200
        hover:shadow-[0_4px_20px_rgba(0,0,0,.16)]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
      "
    >
      {/* ── Image ─────────────────────────────────── */}
      {thumbnailUrl ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300"
            loading="lazy"
          />
          {/* Thin bottom vignette for legibility if text overlaps */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/25 to-transparent" />
        </div>
      ) : (
        /* Placeholder when there is no image */
        <div className="flex aspect-[16/10] w-full items-center justify-center bg-gray-100">
          <svg
            className="h-8 w-8 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
            />
          </svg>
        </div>
      )}

      {/* ── Content ────────────────────────────────── */}
      <div className="flex flex-col gap-2 px-3 py-3">
        {/* Neighbourhood label */}
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
          {neighbourhood}
        </p>

        {/* Title */}
        <h3 className="truncate text-[13px] font-semibold leading-snug text-gray-900">
          {listing.title}
        </h3>

        {/* Details row */}
        {details.length > 0 && (
          <p className="mt-1 truncate text-[11.5px] text-gray-500">
            {details.join(" · ")}
          </p>
        )}

        {/* Price + CTA */}
        <div className="mt-1 flex items-center justify-between">
          {formattedRent ? (
            <span className="text-[13px] font-bold text-gray-900">
              {formattedRent}
            </span>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            className="
              rounded-full bg-gray-900 px-3 py-1 text-[11px] font-semibold
              text-white transition-colors hover:bg-gray-700
              active:bg-gray-800
            "
          >
            Visa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingMapPopup;