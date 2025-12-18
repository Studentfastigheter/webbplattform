"use client";

import { useMemo } from "react";
import BaseMap, {
  type BaseMarker,
  type PopupRenderer,
} from "./BaseMap";
import {
  type ListingId,
  type Listing, // <-- Använd Listing (som är unionen av Company/Private)
} from "@/types";
import ListingMapPopup from "./ListingsMapPopup";

type ListingsMapProps = {
  listings: Listing[];
  className?: string;
  activeListingId?: ListingId;
  onOpenListing?: (id: ListingId) => void;
};

/**
 * Wrapper runt ListingMapPopup så den matchar BaseMaps PopupRenderer-signatur.
 * Vi ignorerar zoom/isActive här för att få exakt samma ruta oavsett.
 */
const createListingPopupRenderer =
  (
    listing: Listing,
    onOpenListing?: (id: ListingId) => void,
  ): PopupRenderer =>
  () =>
    (
      <ListingMapPopup
        listing={listing}
        onOpen={onOpenListing}
      />
    );

const ListingsMap: React.FC<ListingsMapProps> = ({
  listings,
  className,
  activeListingId,
  onOpenListing,
}) => {
  const markers: BaseMarker[] = useMemo(
    () =>
      listings
        .filter((l) => typeof l.lat === "number" && typeof l.lng === "number")
        .map((l) => ({
          id: l.id, // <-- VIKTIGT: Heter nu 'id', inte 'listingId'
          position: [l.lat as number, l.lng as number],
          popup: createListingPopupRenderer(l, onOpenListing),
        })),
    [listings, onOpenListing],
  );

  return (
    <BaseMap
      markers={markers}
      zoom={6}
      center={[59, 15]}
      className={className}
      activeMarkerId={activeListingId}
    />
  );
};

export default ListingsMap;