"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import { ShareDialog } from "@/components/ui/ShareDialog"; 
import { listingService } from "@/services/listing-service"; 
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

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
  const { user } = useAuth();

  React.useEffect(() => {
    if (isFavorite !== undefined) {
      setIsFav(isFavorite);
    }
  }, [isFavorite]);

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

  const isRentNumber = typeof rent === "number";
  const rentValue = isRentNumber ? rent.toLocaleString("sv-SE") : "Ej angiven";

  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        "rounded-3xl",
        "bg-white",
        "border border-gray-100",
        "shadow-[0_8px_30px_rgb(0,0,0,0.06)]",
        "p-6",
        className
      )}
      style={{ width: width ?? "100%", maxWidth: 320, height }}
    >
      {/* Rad 1: Etikett, Pris & Ikoner */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Månadshyra
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-gray-900">
              {rentValue}
            </span>
            {isRentNumber && (
              <span className="text-sm font-medium text-gray-500">kr</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1">
          {/* Hjärta-knapp (Bara synlig om inloggad) */}
          {user && (
            <button 
              type="button"
              onClick={handleToggleFavorite}
              disabled={isLoadingFav}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200",
                isFav 
                  ? "bg-red-50 text-red-500 hover:bg-red-100" 
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-red-500",
                "active:scale-95"
              )}
              aria-label={isFav ? "Ta bort från favoriter" : "Lägg till i favoriter"}
            >
              <Heart className={cn("w-[22px] h-[22px]", isFav && "fill-current")} />
            </button>
          )}

          {/* Dela-knapp inuti ShareDialog */}
          <ShareDialog>
            <button 
              type="button" 
              aria-label="Dela bostad"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-blue-600 active:scale-95"
            >
              <Share2 className="w-[20px] h-[20px]" />
            </button>
          </ShareDialog>
        </div>
      </div>

      {/* Rad 4: Knapp */}
      <Button
        onClick={onApplyClick}
        disabled={applyDisabled}
        className={cn(
          "w-full h-12 flex items-center justify-center gap-2",
          "rounded-full",
          "bg-[#004323] text-white",
          "text-[15px] font-medium",
          "shadow-md hover:shadow-lg transition-all",
          "hover:bg-[#00331b] active:scale-[0.98]"
        )}
      >
        {isFav ? "You’re interested" : "Show interest"} 
      </Button>
    </div>
  );
}