"use client";

import React from "react";

export type ListingPopupData = {
  id: string;
  title: string;
  city: string;
  address?: string;
  rent?: number;
  imageUrl?: string;
};

type ListingMapPopupProps = {
  listing: ListingPopupData;
  onOpen?: (id: string) => void;
};

const formatRent = (rent?: number) =>
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

  const handleOpen = () => onOpen?.(listing.id);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpen();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className="w-[240px] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      {/* Bild med overlay */}
      {listing.imageUrl && (
        <div className="relative h-[140px] w-full">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4 pt-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-900 shadow-sm backdrop-blur">
              {listing.city}
              {formattedRent && (
                <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-bold text-white">
                  {formattedRent}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm font-semibold text-white drop-shadow-sm">
              {listing.title}
            </p>
          </div>
        </div>
      )}

      {/* Info-del */}
      <div className="space-y-2 px-4 pb-4 pt-3 text-sm">
        {!listing.imageUrl && (
          <>
            <div className="font-semibold text-gray-900">{listing.title}</div>
            <div className="text-xs text-gray-700">{listing.city}</div>
          </>
        )}

        {listing.address && (
          <div className="text-xs text-gray-500">{listing.address}</div>
        )}

        <div className="pt-1 flex items-center justify-between">
          {formattedRent && (
            <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-900">
              {formattedRent}
            </div>
          )}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleOpen();
            }}
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-black"
          >
            Visa boende
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingMapPopup;
