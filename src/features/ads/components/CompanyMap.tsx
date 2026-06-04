"use client";

import { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import type { ListingCardDTO } from "@/types/listing";

// Reuse the same map component the housing detail page uses so the visual
// rhythm (markers, clusters, popups, padding) is consistent across the app.
// `dynamic` with ssr:false because react-leaflet has no SSR support.
const ListingsMap = dynamic(() => import("@/components/shared/map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-3xl bg-gray-100" />
  ),
});

type CompanyMapProps = {
  listings: ListingCardDTO[];
  getIsFavorite?: (id: string) => boolean;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
};

// ── Main component ───────────────────────────────────────────────────────────

export default function CompanyMap({
  listings,
  getIsFavorite,
  onFavoriteToggle,
}: CompanyMapProps) {
  const router = useRouter();

  const mapListings = useMemo<ListingCardDTO[]>(
    () =>
      listings.filter(
        (listing) =>
          typeof listing.lat === "number" && typeof listing.lng === "number",
      ),
    [listings],
  );

  const handleOpenListing = useCallback(
    (id: string) => {
      router.push(`/housing/${id}`);
    },
    [router],
  );

  // Render guard — keep the page clean if no company listings have coordinates.
  if (mapListings.length === 0) return null;

  return (
    <section className="w-full">
      {/*
        Map shell — matches the housing detail page's map preview frame
        (height, radius, border, shadow). `isolate` creates a new stacking
        context so Leaflet's internal z-indexes (panes go up to 700) stay
        local to this container; without it the dropdown / lightbox would
        render under the map.
      */}
      <div className="relative isolate z-0 h-[70vh] min-h-[520px] max-h-[860px] w-full overflow-hidden rounded-3xl border border-black/5 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
        <ListingsMap
          listings={mapListings}
          className="h-full w-full"
          fillContainer
          getIsFavorite={getIsFavorite}
          onFavoriteToggle={onFavoriteToggle}
          onOpenListing={handleOpenListing}
        />
      </div>
    </section>
  );
}
