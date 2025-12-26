"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import { ShareDialog } from "@/components/ui/ShareDialog"; 
import { listingService } from "@/services/listing-service"; // Importera din service

type HousingInfoBoxProps = {
  listingId: string;       // NY: Krävs för att veta vilken annons vi gillar
  isFavorite?: boolean;    // NY: Startvärde (kommer från backend)
  
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
  isFavorite = false, // Default till false om det inte skickas med
  rent,
  moveInDate,
  lastApplyDate,
  width,
  height,
  className = "",
  onApplyClick,
  applyDisabled,
}: HousingInfoBoxProps) {
  
  // State för att hantera om annonsen är likad eller inte
  const [isFav, setIsFav] = useState(isFavorite);
  const [isLoadingFav, setIsLoadingFav] = useState(false);

  // Hantera klick på hjärtat
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    // Stoppa eventuella klick på länkar om denna komponent ligger i ett kort
    e.preventDefault();
    e.stopPropagation();

    if (isLoadingFav) return;

    // 1. Optimistisk uppdatering (byt ikon direkt för snabb känsla)
    const previousState = isFav;
    const newState = !previousState;
    setIsFav(newState);
    setIsLoadingFav(true);

    try {
      if (newState) {
        // Om den ska bli favorit -> Anropa addFavorite
        await listingService.addFavorite(listingId);
      } else {
        // Om den ska tas bort -> Anropa removeFavorite
        await listingService.removeFavorite(listingId);
      }
    } catch (error) {
      console.error("Kunde inte ändra favoritstatus:", error);
      // 2. Om det misslyckas, rulla tillbaka till föregående state
      setIsFav(previousState);
    } finally {
      setIsLoadingFav(false);
    }
  };

  const formattedRent =
    typeof rent === "number"
      ? `${rent.toLocaleString("sv-SE")} kr/månad`
      : "Hyra ej angiven";
  const formattedMoveIn = moveInDate ?? "Inte angivet";
  const formattedApplyBy = lastApplyDate ?? "Inte angivet";

  return (
    <div
      className={`
        inline-flex flex-col
        rounded-[40px]
        bg-white
        border border-black/5
        shadow-[0_3px_4px_rgba(0,0,0,0.25)]
        overflow-hidden
        ${className}
      `}
      style={{ width: width ?? 280, height }}
    >
      {/* Rad 1: Hyra + ikoner */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <span className="text-[21px] leading-[24px] font-semibold text-gray-900">
          {formattedRent}
        </span>

        <div className="flex items-center gap-3">
          {/* Hjärta-knapp */}
          <button 
            type="button"
            onClick={handleToggleFavorite}
            disabled={isLoadingFav}
            className={`
              transition-all duration-200 
              hover:scale-110 active:scale-95
              ${isFav ? "text-red-500" : "text-gray-500 hover:text-red-500"}
            `}
            aria-label={isFav ? "Ta bort från favoriter" : "Lägg till i favoriter"}
          >
            {/* fill-current gör att hjärtat fylls med färg om isFav är true */}
            <Heart className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
          </button>

          {/* Dela-knapp inuti ShareDialog */}
          <ShareDialog>
            <button 
              type="button" 
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </ShareDialog>

        </div>
      </div>

      {/* Rad 2: Inflyttningsdatum */}
      <div className="px-5 py-1">
        <span className="text-[12px] leading-[14px] text-[#666666]">
          Inflyttningsdatum: {formattedMoveIn}
        </span>
      </div>

      {/* Rad 3: Sista anmälningsdag */}
      <div className="px-5 pb-2 pt-1">
        <span className="text-[12px] leading-[14px] text-[#666666]">
          Sista anmälningsdag: {formattedApplyBy}
        </span>
      </div>

      {/* Rad 4: Knapp */}
      <div className="px-5 pb-4 pt-1">
        <Button
          onClick={onApplyClick}
          disabled={applyDisabled}
          className={`
            w-full h-[31px]
            rounded-full
            bg-[#004323] text-white
            text-[14px] leading-[16px]
            normal-case
            shadow-[0_3px_4px_rgba(0,0,0,0.25)]
            hover:bg-[#00331b]
          `}
        >
          Intresseanmälan
        </Button>
      </div>
    </div>
  );
}