"use client";

import React from "react";
import { ListingCardDTO } from "@/types/listing";
import ListingCardSmall from "@/components/Listings/ListingCard_Small";

type ListingMapPopupProps = {
  listing: ListingCardDTO;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
  onOpen?: (id: string) => void;
};

const ListingMapPopup: React.FC<ListingMapPopupProps> = ({
  listing,
  isFavorite,
  onFavoriteToggle,
  onOpen,
}) => {
  return (
    <div className="w-[300px]">
      <ListingCardSmall
        title={listing.title}
        area={listing.location?.split(",")[0] || "Ej angivet"} 
        city={listing.location?.split(",")[1]?.trim() || listing.location || "Ej angivet"} 
        dwellingType={listing.dwellingType || "Bostad"}
        rooms={listing.rooms || 0}
        sizeM2={listing.sizeM2 || 0}
        rent={listing.rent || 0}
        landlordType={listing.hostType}
        hostName={listing.hostName}
        hostLogoUrl={listing.hostLogoUrl}
        isVerified={listing.verifiedHost}
        isFavorite={isFavorite}
        onFavoriteToggle={onFavoriteToggle}
        imageUrl={listing.imageUrl}
        tags={listing.tags}
        onClick={() => onOpen?.(listing.id)}
        variant="compact"
      />
    </div>
  );
};

export default ListingMapPopup;