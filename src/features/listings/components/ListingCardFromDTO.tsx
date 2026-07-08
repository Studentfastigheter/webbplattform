"use client";

import type React from "react";
import ListingCardSmall, {
  type ListingCardSmallProps,
} from "@/features/listings/components/ListingCard_Small";
import type { ListingCardDTO } from "@/types/listing";

type ListingCardFromDTOProps = {
  listing: ListingCardDTO;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
  onOpen?: (id: string) => void;
} & Pick<
  ListingCardSmallProps,
  | "variant"
  | "onHoverChange"
  | "footerContent"
  | "showFavoriteButton"
  | "imageOverlayContent"
  | "imageTopRightContent"
  | "showHostLogo"
  | "contentTopRightContent"
>;

const ListingCardFromDTO: React.FC<ListingCardFromDTOProps> = ({
  listing,
  isFavorite,
  onFavoriteToggle,
  onOpen,
  ...cardProps
}) => {
  return (
    <ListingCardSmall
      id={listing.id}
      title={listing.title}
      location={listing.location}
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
      {...cardProps}
    />
  );
};

export default ListingCardFromDTO;
