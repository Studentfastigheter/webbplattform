import React from "react";
import clsx from "clsx";
import { Heart, Share2, Home, MapPin, Building2 } from "lucide-react";
import Tag from "../ui/Tag";
import type { ListFrameRow } from "../layout/ListFrame";
import { Button } from "@heroui/button";
import StatusTag, { type Status } from "../ui/statusTag";

type ListingApplicationRowProps = {
  id: string | number;
  title: string;
  rent: number;
  area: string;
  city: string;
  dwellingType: string;
  rooms: number;
  sizeM2: number;
  landlordType: string;
  imageUrl: string;
  isVerified?: boolean;
  tags?: string[];
  status: Status;              // ⬅️ direkt status till StatusTag
  applicationDate: string;
  onManage?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(value);

const AdCell: React.FC<
  Pick<
    ListingApplicationRowProps,
    | "title"
    | "rent"
    | "area"
    | "city"
    | "dwellingType"
    | "rooms"
    | "sizeM2"
    | "landlordType"
    | "imageUrl"
    | "isVerified"
  >
> = ({ title, rent, area, city, dwellingType, rooms, sizeM2, landlordType, imageUrl, isVerified }) => (
  <div className="flex items-start gap-4">
    <div className="h-[120px] w-[120px] flex-shrink-0 overflow-hidden rounded-[15px] bg-gray-100">
      <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
    </div>
    <div className="flex flex-col gap-1">
      {isVerified && (
        <div className="mb-1">
          <Tag
            text="Verifierad hyresvärd"
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
        {formatCurrency(rent)} kr/månad
      </div>
      <div className="flex flex-col gap-1 text-[12px] leading-[14px] text-[#5b5b5b]">
        <span className="flex items-center gap-1.5">
          <MapPin size={14} strokeWidth={2} />
          {area}, {city}
        </span>
        <span className="flex items-center gap-1.5">
          <Home size={14} strokeWidth={2} />
          {dwellingType} / {rooms} rum / {sizeM2} m²
        </span>
        <span className="flex items-center gap-1.5">
          <Building2 size={14} strokeWidth={2} />
          {landlordType}
        </span>
      </div>
    </div>
  </div>
);

const TagsCell: React.FC<{ tags?: string[] }> = ({ tags = [] }) => (
  <div className="flex flex-wrap gap-2">
    {tags.map((tag) => (
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

// 🔹 Enkel StatusCell som bara skickar vidare status till StatusTag
const StatusCell: React.FC<{ status: Status }> = ({ status }) => {
  return (
    <div className="flex justify-center">
      <StatusTag status={status} />
    </div>
  );
};

const DateCell: React.FC<{ date: string }> = ({ date }) => (
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
  const { id, tags, status, applicationDate, ...adProps } = props;

  return {
    id,
    cells: [
      <AdCell key={`${id}-ad`} {...adProps} />,
      <TagsCell key={`${id}-tags`} tags={tags} />,
      <StatusCell key={`${id}-status`} status={status} />,
      <DateCell key={`${id}-date`} date={applicationDate} />,
      <ActionsCell key={`${id}-actions`} {...props} />,
    ],
  };
};

export default buildListingApplicationRow;
