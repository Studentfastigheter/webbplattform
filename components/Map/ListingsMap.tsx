"use client";

import { useMemo } from "react";
import BaseMap, {
  type BaseMarker,
  type PopupRenderer,
} from "./BaseMap";
import ListingMapPopup from "./ListingsMapPopup";

type ListingItem = {
  id: string;
  title: string;
  address?: string;
  city: string;
  lat: number;
  lng: number;
  rent?: number;
  imageUrl?: string;
};

type ListingsMapProps = {
  listings: ListingItem[];
  className?: string;
  activeListingId?: string;
  onOpenListing?: (id: string) => void;
};

/**
 * Wrapper runt ListingMapPopup så den matchar BaseMaps PopupRenderer-signatur.
 * Vi ignorerar zoom/isActive här för att få exakt samma ruta oavsett.
 */
const createListingPopupRenderer =
  (listing: ListingItem, onOpenListing?: (id: string) => void): PopupRenderer =>
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
      listings.map((l) => ({
        id: l.id,
        position: [l.lat, l.lng] as [number, number],
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
