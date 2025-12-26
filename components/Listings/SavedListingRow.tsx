"use client";

import React, { useState } from "react";
import { Share2, Heart, Home, MapPin, Building2 } from "lucide-react";
import Tag from "@/components/ui/Tag";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/ui/ShareDialog"; // Importera din ShareDialog
import { listingService } from "@/services/listing-service"; // Importera servicen

export type SavedListingRowProps = {
  listingId: string;
  title: string;
  rent?: number | null;
  area?: string | null;
  city?: string | null;
  dwellingType?: string | null;
  rooms?: number | null;
  sizeM2?: number | null;
  landlordLabel?: string | null;
  imageUrl?: string | null;
  tags?: string[] | null;
  verified?: boolean;
  onOpen?: () => void;
  onRemove?: (id: string) => void; // Ny prop: Callback när man tar bort
  onExpressInterest?: () => void;
};

const formatCurrency = (value?: number | null) =>
  typeof value === "number"
    ? `${new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(value)} kr/månad`
    : "Pris saknas";

export default function SavedListingRow({
  listingId,
  title,
  rent,
  area,
  city,
  dwellingType,
  rooms,
  sizeM2,
  landlordLabel,
  imageUrl,
  tags,
  verified,
  onOpen,
  onRemove,
  onExpressInterest,
}: SavedListingRowProps) {
  const [isLoading, setIsLoading] = useState(false);

  const locationLabel = [area, city].filter(Boolean).join(", ") || "Okänd plats";
  const specLabel = [dwellingType, rooms ? `${rooms} rum` : null, sizeM2 ? `${sizeM2} m\u00b2` : null]
    .filter(Boolean)
    .join(" / ");
  const resolvedLandlord = landlordLabel ?? "Hyresvärd";
  const pills = tags ?? [];

  // Hantera borttagning av favorit
  const handleRemoveFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Hindra att vi klickar på hela kortet (öppnar annonsen)
    if (isLoading) return;

    setIsLoading(true);
    try {
      // 1. Anropa backend
      await listingService.removeFavorite(listingId);
      
      // 2. Uppdatera UI i föräldern
      if (onRemove) {
        onRemove(listingId);
      }
    } catch (error) {
      console.error("Kunde inte ta bort favorit", error);
      setIsLoading(false);
    }
  };

  return (
    <div
      className="group flex items-start gap-4 rounded-2xl border bg-white p-4 shadow-sm transition hover:bg-muted/50 hover:shadow-md cursor-pointer"
      role="article"
      onClick={onOpen}
    >
      {/* BILD */}
      <div className="h-[110px] w-[140px] flex-shrink-0 overflow-hidden rounded-xl border bg-gray-100">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            Ingen bild
          </div>
        )}
      </div>

      {/* INNEHÅLL */}
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          
          {/* Vänster kolumn: Info */}
          <div className="flex flex-1 flex-col items-start gap-1">
            {verified && (
              <Tag
                text="Verifierad hyresvärd"
                bgColor="#0F4D0F"
                textColor="#FFFFFF"
                height={18}
                horizontalPadding={10}
                className="mb-1 inline-flex text-[11px] leading-[13px]"
              />
            )}
            <div className="text-base font-semibold leading-tight text-foreground line-clamp-1">{title}</div>
            <div className="text-[15px] font-semibold text-foreground">{formatCurrency(rent)}</div>
            
            <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} strokeWidth={2} />
                {locationLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <Home size={14} strokeWidth={2} />
                {specLabel || "Okänd typ"}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 size={14} strokeWidth={2} />
                {resolvedLandlord}
              </span>
            </div>
          </div>

          {/* Höger kolumn: Knappar */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              
              {/* DELA-KNAPP (Inuti Dialog) */}
              <ShareDialog>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()} // Hindra kortklick
                  aria-label="Dela"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border border-muted-foreground/30 bg-white text-foreground",
                    "transition hover:bg-muted hover:text-blue-600"
                  )}
                >
                  <Share2 size={18} />
                </button>
              </ShareDialog>

              {/* FAVORIT-KNAPP (Alltid röd här) */}
              <button
                type="button"
                onClick={handleRemoveFavorite}
                disabled={isLoading}
                aria-label="Ta bort favorit"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border border-muted-foreground/30 bg-white",
                  "transition hover:bg-red-50 hover:border-red-200",
                  "text-red-500" // Alltid röd text
                )}
              >
                {/* fill-current gör den ifylld */}
                <Heart size={18} className="fill-current" />
              </button>
            </div>

            <Button
              type="button"
              size="sm"
              variant="default"
              className="h-8 text-xs rounded-full px-4"
              onClick={(e) => {
                e.stopPropagation();
                onExpressInterest?.();
              }}
            >
              Intresseanmäl
            </Button>
          </div>
        </div>

        {/* Taggar */}
        {pills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pills.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-muted-foreground/20 bg-muted px-3 py-1 text-xs font-medium text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}