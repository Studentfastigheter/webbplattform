"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";

import ListingCardFromDTO from "@/features/listings/components/ListingCardFromDTO";
import { Button } from "@/components/ui/button";
import {
  canUseFavorites,
  useFavorites,
  useToggleFavorite,
} from "@/features/listings/hooks/useListings";
import { listingService } from "@/features/listings/services/listing-service";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import type { ListingCardDTO } from "@/types/listing";

const ListingsMap = dynamic(() => import("@/components/shared/map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[360px] w-full animate-pulse rounded-2xl bg-gray-100" />
  ),
});

export default function Page() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { locale, localizedHref } = useI18n();
  const canViewFavorites = canUseFavorites(user);
  const { data: favorites = [], isLoading: loading } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const [hoveredListingId, setHoveredListingId] = useState<string | undefined>();
  const favoriteIds = useMemo(
    () => new Set(favorites.map((listing) => listing.id)),
    [favorites],
  );

  useEffect(() => {
    if (authLoading || canViewFavorites) return;
    router.replace(localizedHref(user ? "/housing" : "/login"));
  }, [authLoading, canViewFavorites, localizedHref, router, user]);

  /**
   * Sparade only ever removes — but we keep the symmetric API
   * (id, isFavorite) so the ListingCardFromDTO contract is unchanged.
   * Optimistic patch + rollback is handled inside useToggleFavorite via the
   * favorites cache, so the list updates instantly without local state.
   */
  const handleFavoriteToggle = useCallback(
    (id: string, isFavorite: boolean) => {
      if (isFavorite) return;
      setHoveredListingId((current) => (current === id ? undefined : current));
      toggleFavorite.mutate({ listingId: id, nextIsFavorite: false });
    },
    [toggleFavorite],
  );

  const openListing = useCallback(
    (id: string) => {
      router.push(localizedHref(`/housing/${id}`));
    },
    [localizedHref, router],
  );

  if (authLoading || !canViewFavorites || loading) {
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
              {localizedText(locale, "Inga sparade annonser", "No saved listings")}
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-black/55">
              {localizedText(
                locale,
                "När du sparar bostäder visas de här tillsammans med kartan.",
                "When you save homes, they appear here together with the map.",
              )}
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => router.push(localizedHref("/housing"))}
            >
              {localizedText(locale, "Hitta bostäder", "Find homes")}
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
