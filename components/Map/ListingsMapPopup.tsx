"use client";

import React from "react";
import { ListingCardDTO } from "@/types/listing";
import ListingCardFromDTO from "@/components/Listings/ListingCardFromDTO";

type ListingMapPopupProps = {
  listing: ListingCardDTO;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
  onOpen?: (id: string) => void;
  imageOverlayContent?: React.ReactNode;
};

const ListingMapPopup: React.FC<ListingMapPopupProps> = ({
  listing,
  isFavorite,
  onFavoriteToggle,
  onOpen,
  imageOverlayContent,
}) => {
  return (
    <div className="w-[320px] max-w-[calc(100vw-48px)]">
      <ListingCardFromDTO
        listing={listing}
        isFavorite={isFavorite}
        onFavoriteToggle={onFavoriteToggle}
        onOpen={onOpen}
        imageOverlayContent={imageOverlayContent}
      />
    </div>
  );
};

export default ListingMapPopup;
