"use client";

import type React from "react";
import ListingCardSmall, {
  type ListingCardSmallProps,
} from "@/features/listings/components/ListingCard_Small";
import type { ListingCardDTO } from "@/types/listing";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

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

const splitLocation = (location: string | null | undefined, fallback: string) => {
  const [area, ...cityParts] = (location ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const city = cityParts.join(", ");

  return {
    area: area || fallback,
    city: city || location || fallback,
  };
};

const ListingCardFromDTO: React.FC<ListingCardFromDTOProps> = ({
  listing,
  isFavorite,
  onFavoriteToggle,
  onOpen,
  ...cardProps
}) => {
  const { locale } = useI18n();
  const fallback = localizedText(locale, "Ej angivet", "Not specified");
  const { area, city } = splitLocation(listing.location, fallback);

  return (
    <ListingCardSmall
      id={listing.id}
      title={listing.title}
      area={area}
      city={city}
      dwellingType={listing.dwellingType || localizedText(locale, "Bostad", "Home")}
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
