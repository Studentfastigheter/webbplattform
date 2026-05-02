"use client";

import { useMemo } from "react";
import BaseMap, {
  type BaseMarker,
  type PopupRenderer,
} from "./BaseMap";
// VIKTIGT: Vi byter från 'Listing' till 'ListingCardDTO'
import { ListingCardDTO } from "@/types/listing";
import ListingMapPopup from "./ListingsMapPopup";

type ListingsMapProps = {
  listings: ListingCardDTO[]; // <-- Uppdaterad typ
  className?: string;
  activeListingId?: string;
  fillContainer?: boolean;
  getIsFavorite?: (id: string) => boolean;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
  onOpenListing?: (id: string) => void;
};

/**
 * Wrapper runt ListingMapPopup så den matchar BaseMaps PopupRenderer-signatur.
 */
const createListingPopupRenderer =
  (
    listing: ListingCardDTO, // <-- Uppdaterad typ
    isFavorite?: boolean,
    onFavoriteToggle?: (id: string, isFav: boolean) => void,
    onOpenListing?: (id: string) => void,
  ): PopupRenderer =>
  ({ imageOverlayContent }) =>
    (
      <ListingMapPopup
        listing={listing}
        isFavorite={isFavorite}
        onFavoriteToggle={onFavoriteToggle}
        onOpen={onOpenListing}
        imageOverlayContent={imageOverlayContent}
      />
    );

const ListingsMap: React.FC<ListingsMapProps> = ({
  listings,
  className,
  activeListingId,
  fillContainer,
  getIsFavorite,
  onFavoriteToggle,
  onOpenListing,
}) => {
  const markers: BaseMarker[] = useMemo(
    () =>
      listings
        // Vi måste säkerställa att lat/lng inte är null/undefined
        .filter((l) => typeof l.lat === "number" && typeof l.lng === "number")
        .map((l) => ({
          id: l.id,
          position: [l.lat as number, l.lng as number],
          popup: createListingPopupRenderer(l, getIsFavorite?.(l.id), onFavoriteToggle, onOpenListing),
        })),
    [listings, getIsFavorite, onFavoriteToggle, onOpenListing],
  );

  return (
    <BaseMap
      markers={markers}
      zoom={5}
      center={[62, 15]}
      className={className}
      activeMarkerId={activeListingId}
      fillContainer={fillContainer}
    />
  );
};

export default ListingsMap;
