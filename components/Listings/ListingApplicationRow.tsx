import React from "react";
import clsx from "clsx";
import { Heart, Share2, Home, MapPin, Building2 } from "lucide-react";
import Tag from "../ui/Tag";
import type { ListFrameRow } from "../layout/ListFrame";
import { Button } from "@heroui/button";
import StatusTag, { type Status } from "../ui/statusTag";
import type { DateString, ListingWithRelations } from "@/types";

type ListingSummary = Pick<
  ListingWithRelations,
  | "listingId"
  | "title"
  | "area"
  | "city"
  | "dwellingType"
  | "rooms"
  | "sizeM2"
  | "rent"
  | "tags"
  | "images"
  | "advertiser"
> & {
  imageUrl?: string;
  landlordType?: string;
  isVerified?: boolean;
};

export type ListingApplicationRowProps = ListingSummary & {
  status: Status;
  applicationDate: DateString;
  onManage?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
};

const formatCurrency = (value?: number | null) =>
  typeof value === "number"
    ? new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(value)
    : null;

const AdCell: React.FC<{ listing: ListingSummary }> = ({ listing }) => {
  const {
    title,
    rent,
    area,
    city,
    dwellingType,
    rooms,
    sizeM2,
    landlordType,
    images,
    imageUrl,
    isVerified,
    advertiser,
  } = listing;

  const resolvedImage = imageUrl ?? images?.[0]?.imageUrl;
  const resolvedRent = formatCurrency(rent);
  const locationLabel = [area, city].filter(Boolean).join(", ") || "-";
  const landlordLabel = landlordType ?? advertiser?.displayName ?? "Hyresvard";

  return (
    <div className="flex items-start gap-4">
      <div className="h-[120px] w-[120px] flex-shrink-0 overflow-hidden rounded-[15px] bg-gray-100">
        {resolvedImage ? (
          <img src={resolvedImage} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        {isVerified && (
          <div className="mb-1">
            <Tag
              text="Verifierad hyresvard"
              bgColor="#0F4D0F"
              textColor="#FFFFFF"
              height={18}
              horizontalPadding={10}
              className="text-[11px] leading-[13px]"
            />
          </div>
        )}
        <div className="text-[16px] font-semibold leading-[18px] text-black">{title}</div>
        <div className="text-[15px] font-semibold leading-[18px] text-black">
          {resolvedRent ? `${resolvedRent} kr/manad` : "-"}
        </div>
        <div className="flex flex-col gap-1 text-[12px] leading-[14px] text-[#5b5b5b]">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} strokeWidth={2} />
            {locationLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <Home size={14} strokeWidth={2} />
            {dwellingType ?? "-"} / {rooms ?? "-"} rum / {sizeM2 ?? "-"} m{"\u00b2"}
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 size={14} strokeWidth={2} />
            {landlordLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

const TagsCell: React.FC<{ tags?: ListingApplicationRowProps["tags"] }> = ({
  tags,
}) => {
  const safeTags = tags ?? [];

  return (
    <div className="flex flex-wrap gap-2">
      {safeTags.map((tag) => (
        <Tag
          key={tag}
          text={tag}
          bgColor="#F0F0F0"
          textColor="#000000"
          height={20}
          horizontalPadding={10}
          className="text-[12px] leading-[14px]"
        />
      ))}
    </div>
  );
};

const StatusCell: React.FC<{ status: Status }> = ({ status }) => (
  <div className="flex justify-center">
    <StatusTag status={status} />
  </div>
);

const DateCell: React.FC<{ date: DateString }> = ({ date }) => (
  <div className="text-sm text-left text-black">{date}</div>
);

const ActionsCell: React.FC<
  Pick<ListingApplicationRowProps, "onManage" | "onFavorite" | "onShare">
> = ({ onManage, onFavorite, onShare }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={onFavorite}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#CFCFCF] bg-white text-black transition hover:bg-[#f5f5f5]"
      >
        <Heart size={18} />
      </button>
      <button
        type="button"
        onClick={onShare}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#CFCFCF] bg-white text-black transition hover:bg-[#f5f5f5]"
      >
        <Share2 size={18} />
      </button>
    </div>
    <Button
      type="button"
      onClick={onManage}
      className={clsx(
        "h-9 w-[84px] rounded-full bg-[#D9D9D9] text-[12px] font-medium text-black",
        "transition hover:bg-[#cfcfcf]"
      )}
    >
      Hantera
    </Button>
  </div>
);

export const buildListingApplicationRow = (props: ListingApplicationRowProps): ListFrameRow => {
  const { listingId, tags, status, applicationDate, onManage, onFavorite, onShare } =
    props;

  return {
    id: listingId,
    cells: [
      <AdCell key={`${listingId}-ad`} listing={props} />,
      <TagsCell key={`${listingId}-tags`} tags={tags} />,
      <StatusCell key={`${listingId}-status`} status={status} />,
      <DateCell key={`${listingId}-date`} date={applicationDate} />,
      <ActionsCell
        key={`${listingId}-actions`}
        onManage={onManage}
        onFavorite={onFavorite}
        onShare={onShare}
      />,
    ],
  };
};

export default buildListingApplicationRow;
