"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import { ShareDialog } from "@/components/ui/ShareDialog";
import { listingService } from "@/services/listing-service";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type HousingInfoBoxProps = {
  listingId: string;
  isFavorite?: boolean;

  rent?: number | null;
  moveInDate?: string | null;
  lastApplyDate?: string | null;
  width?: number | string;
  height?: number | string;
  className?: string;
  onApplyClick?: () => void;
  applyDisabled?: boolean;
};

export default function HousingInfoBox({
  listingId,
  isFavorite = false,
  rent,
  moveInDate,
  lastApplyDate,
  width,
  height,
  className = "",
  onApplyClick,
  applyDisabled,
}: HousingInfoBoxProps) {

  const [isFav, setIsFav] = useState(isFavorite);
  const [isLoadingFav, setIsLoadingFav] = useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    if (isFavorite !== undefined) {
      setIsFav(isFavorite);
    }
  }, [isFavorite]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoadingFav) return;

    const previousState = isFav;
    const newState = !previousState;
    setIsFav(newState);
    setIsLoadingFav(true);

    try {
      if (newState) {
        await listingService.addFavorite(listingId);
      } else {
        await listingService.removeFavorite(listingId);
      }
    } catch (error) {
      console.error("Kunde inte ändra favoritstatus:", error);
      setIsFav(previousState);
    } finally {
      setIsLoadingFav(false);
    }
  };

  const isRentNumber = typeof rent === "number";
  const rentValue = isRentNumber ? rent.toLocaleString("sv-SE") : "Ej angiven";

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        "rounded-2xl",
        "bg-white",
        "border border-gray-200/80",
        "shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
        "p-5",
        className
      )}
      style={{ width: width ?? "100%", maxWidth: 320, height }}
    >
      {/* Pris */}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Månadshyra
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            {rentValue}
          </span>
          {isRentNumber && (
            <span className="text-sm font-medium text-gray-400">kr/mån</span>
          )}
        </div>
      </div>

      {/* Datum-info */}
      {(moveInDate || lastApplyDate) && (
        <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
          {moveInDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Inflyttning</span>
              <span className="font-medium text-gray-900">{moveInDate}</span>
            </div>
          )}
          {lastApplyDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Sista ansökan</span>
              <span className="font-medium text-gray-900">{lastApplyDate}</span>
            </div>
          )}
        </div>
      )}

      {/* Ansök-knapp */}
      <Button
        onClick={onApplyClick}
        disabled={applyDisabled}
        className={cn(
          "w-full h-11 flex items-center justify-center gap-2",
          "rounded-full",
          "bg-[#004225] text-white",
          "text-[14px] font-medium",
          "shadow-sm hover:shadow-md transition-all",
          "hover:bg-[#00331b] active:scale-[0.98]"
        )}
      >
        Visa intresse
      </Button>

      {/* Åtgärdsknappar — samma stil som alla-koer */}
      <div className="flex items-center justify-center gap-1 border-t border-gray-100 pt-4">
        {user && (
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={isLoadingFav}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              isFav
                ? "text-red-500 hover:bg-red-50"
                : "text-gray-400 hover:bg-gray-100 hover:text-red-500"
            )}
            aria-label={isFav ? "Ta bort från favoriter" : "Lägg till i favoriter"}
          >
            <Heart className={cn("h-[18px] w-[18px]", isFav && "fill-current")} />
          </button>
        )}

        {user && (
          <div className="mx-0.5 h-5 w-px bg-gray-200" />
        )}

        <ShareDialog>
          <button
            type="button"
            aria-label="Dela bostad"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <Share2 className="h-[18px] w-[18px]" />
          </button>
        </ShareDialog>
      </div>
    </div>
  );
}
