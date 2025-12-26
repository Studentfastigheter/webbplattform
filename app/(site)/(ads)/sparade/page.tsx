"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import SavedListingRow from "@/components/Listings/SavedListingRow"; // Den vi uppdaterade i steg 3
import SwitchSelect, { type SwitchSelectValue } from "@/components/ui/switchSelect";
import { ListingCardDTO } from "@/types/listing"; // Din DTO typ
import { listingService } from "@/services/listing-service";
import { Button } from "@/components/ui/button";

// Dynamisk import av kartan
const ListingsMap = dynamic(() => import("@/components/Map/ListingsMap"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl" />
});

export default function Page() {
  const router = useRouter();
  const [view, setView] = useState<SwitchSelectValue>("lista");
  const [favorites, setFavorites] = useState<ListingCardDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Hämta favoriter vid sidladdning
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await listingService.getFavorites();
        // Backend returnerar en lista av ListingCardDTO
        setFavorites(data);
      } catch (error) {
        console.error("Kunde inte hämta favoriter:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // 2. Funktion för att ta bort från listan (skickas till SavedListingRow)
  const removeListingFromView = (idToRemove: string) => {
    setFavorites((prev) => prev.filter((item) => item.id.toString() !== idToRemove));
  };

  const isMapView = view === "karta";

  if (loading) {
    return (
      <main className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </main>
    );
  }

  return (
    <main className="pb-12 pt-6">
      <div className="w-full space-y-4">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Sparade annonser</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {favorites.length} {favorites.length === 1 ? "sparad annons" : "sparade annonser"}
            </p>
          </div>
          <SwitchSelect value={view} onChange={setView} />
        </div>

        {/* Content */}
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-gray-50/50 py-16 text-center">
            <h3 className="text-lg font-medium text-gray-900">Inga sparade annonser</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm">
              När du hjärtmarkerar annonser i flödet kommer de att dyka upp här så att du enkelt hittar tillbaka.
            </p>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => router.push("/bostader")}
            >
              Hitta bostäder
            </Button>
          </div>
        ) : isMapView ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col gap-4">
              {favorites.map((listing) => (
                <SavedListingRow
                  key={listing.id}
                  listingId={listing.id.toString()}
                  title={listing.title}
                  rent={listing.rent}
                  area={listing.location.split(",")[0]} // Enkel logik för area, justera vid behov
                  city={listing.location.split(",")[1] || listing.location}
                  dwellingType={listing.dwellingType}
                  rooms={listing.rooms}
                  sizeM2={listing.sizeM2}
                  imageUrl={listing.imageUrl}
                  onOpen={() => router.push(`/bostader/${listing.id}`)}
                  onRemove={removeListingFromView}
                />
              ))}
            </div>
            <div className="sticky top-6 h-[calc(100vh-100px)] overflow-hidden rounded-2xl border shadow-sm">
               {/* Anpassa ListingsMap så den tar emot ListingCardDTO om den inte gör det redan */}
              <ListingsMap
                listings={favorites as any} // Castas om typen skiljer sig något, eller mappa om
                onOpenListing={(id) => router.push(`/bostader/${id}`)}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-4xl">
            {favorites.map((listing) => (
              <SavedListingRow
                key={listing.id}
                listingId={listing.id.toString()}
                title={listing.title}
                rent={listing.rent}
                area={listing.location.split(",")[0]}
                city={listing.location.split(",")[1] || listing.location}
                dwellingType={listing.dwellingType}
                rooms={listing.rooms}
                sizeM2={listing.sizeM2}
                imageUrl={listing.imageUrl}
                onOpen={() => router.push(`/bostader/${listing.id}`)}
                onRemove={removeListingFromView}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}