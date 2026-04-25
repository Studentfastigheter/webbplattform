"use client";

import type React from "react";
import ListingCardSmall, {
  type ListingCardSmallProps,
} from "@/components/Listings/ListingCard_Small";
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
  | "imageTopRightContent"
  | "showHostLogo"
  | "contentTopRightContent"
>;

const splitLocation = (location?: string | null) => {
  const [area, ...cityParts] = (location ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const city = cityParts.join(", ");

  return {
    area: area || "Ej angivet",
    city: city || location || "Ej angivet",
  };
};

const ListingCardFromDTO: React.FC<ListingCardFromDTOProps> = ({
  listing,
  isFavorite,
  onFavoriteToggle,
  onOpen,
  ...cardProps
}) => {
  const { area, city } = splitLocation(listing.location);

  return (
    <ListingCardSmall
      id={listing.id}
      title={listing.title}
      area={area}
      city={city}
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
      {...cardProps}
    />
  );
};

export default ListingCardFromDTO;
