"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";

import ListingCardFromDTO from "@/components/Listings/ListingCardFromDTO";
import { Button } from "@/components/ui/button";
import { listingService } from "@/services/listing-service";
import type { ListingCardDTO } from "@/types/listing";

const ListingsMap = dynamic(() => import("@/components/Map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[360px] w-full animate-pulse rounded-2xl bg-gray-100" />
  ),
});

export default function Page() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<ListingCardDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredListingId, setHoveredListingId] = useState<string | undefined>();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await listingService.getFavorites();
        setFavorites(data);
      } catch (error) {
        console.error("Kunde inte hämta favoriter:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((listing) => listing.id)),
    [favorites],
  );

  const handleFavoriteToggle = useCallback(
    (id: string, isFavorite: boolean) => {
      if (isFavorite) return;

      const removedListing = favorites.find((listing) => listing.id === id);
      const removedIndex = favorites.findIndex((listing) => listing.id === id);

      setFavorites((current) =>
        current.filter((listing) => listing.id !== id),
      );
      setHoveredListingId((current) => (current === id ? undefined : current));

      listingService.removeFavorite(id).catch((error) => {
        console.error("Kunde inte ta bort favorit:", error);

        if (!removedListing) return;

        setFavorites((current) => {
          if (current.some((listing) => listing.id === id)) return current;

          const next = [...current];
          next.splice(Math.max(removedIndex, 0), 0, removedListing);
          return next;
        });
      });
    },
    [favorites],
  );

  const openListing = useCallback(
    (id: string) => {
      router.push(`/bostader/${id}`);
    },
    [router],
  );

  if (loading) {
    return (
      <main className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </main>
    );
  }

  return (
    <main className="w-full pb-12 pt-4 sm:pt-6">
      <div className="container mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8">
        {favorites.length === 0 ? (
          <section className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-5 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Heart className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-black">
              Inga sparade annonser
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-black/55">
              När du sparar bostäder visas de här tillsammans med kartan.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => router.push("/bostader")}
            >
              Hitta bostäder
            </Button>
          </section>
        ) : (
          <section className="flex flex-col-reverse gap-4 sm:gap-6 lg:grid lg:grid-cols-2 lg:items-start 2xl:grid-cols-3">
            <div className="grid w-full grid-cols-1 justify-items-center gap-3 2xl:col-span-1">
              {favorites.map((listing) => (
                <div
                  key={listing.id}
                  className="flex w-full justify-center"
                  onMouseEnter={() => setHoveredListingId(listing.id)}
                  onMouseLeave={() =>
                    setHoveredListingId((current) =>
                      current === listing.id ? undefined : current,
                    )
                  }
                >
                  <ListingCardFromDTO
                    listing={listing}
                    isFavorite={favoriteIds.has(listing.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                    onOpen={openListing}
                  />
                </div>
              ))}
            </div>

            <div className="z-10 h-[320px] w-full shrink-0 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm sm:h-[420px] lg:sticky lg:top-24 lg:h-[calc(100svh-96px)] lg:rounded-2xl 2xl:col-span-2">
              <ListingsMap
                listings={favorites}
                className="h-full w-full rounded-xl lg:rounded-2xl"
                activeListingId={hoveredListingId}
                fillContainer
                getIsFavorite={(id) => favoriteIds.has(id)}
                onFavoriteToggle={handleFavoriteToggle}
                onOpenListing={openListing}
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
