import React from "react";
import clsx from "clsx";
import { Trash2, Home, MapPin, Building2 } from "lucide-react";
import Tag from "../ui/Tag";
import type { ListFrameRow } from "../layout/ListFrame";
import { Button } from "@/components/ui/button";
import StatusTag, { type Status } from "../ui/statusTag";
import type { AdvertiserSummary, DateString } from "@/types";

type ListingSummary = {
  listingId: string;
  title: string;
  area?: string | null;
  city?: string | null;
  dwellingType?: string | null;
  rooms?: number | null;
  sizeM2?: number | null;
  rent?: number | null;
  tags?: string[] | null;
  images?: Array<{ imageUrl?: string | null }> | null;
  advertiser?: AdvertiserSummary | null;
  imageUrl?: string;
  landlordType?: string;
  isVerified?: boolean;
};

export type ListingApplicationRowProps = ListingSummary & {
  applicationId?: number | string;
  status: Status;
  applicationDate: DateString;
  hasOffer?: boolean;
  isProcessingOffer?: boolean;
  onAcceptOffer?: () => void;
  onRejectOffer?: () => void;
  onWithdraw?: () => void;
  onOpen?: () => void;
};

const formatCurrency = (value?: number | null) =>
  typeof value === "number"
    ? new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(value)
    : null;

const AdCell: React.FC<{ listing: ListingSummary; onOpen?: () => void }> = ({
  listing,
  onOpen,
}) => {
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

  const resolvedImage = imageUrl || images?.find((image) => image.imageUrl)?.imageUrl;
  const resolvedRent = formatCurrency(rent);
  const locationLabel = [area, city].filter(Boolean).join(", ") || "-";
  const landlordLabel = landlordType ?? advertiser?.displayName ?? "Hyresvärd";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-w-0 items-start gap-4 text-left transition hover:opacity-95"
    >
      <div className="relative h-[104px] w-[136px] flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-black/5">
        {resolvedImage ? (
          <img
            src={resolvedImage}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            <Home className="h-7 w-7" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
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
        <div className="line-clamp-2 text-[16px] font-semibold leading-[18px] text-black">
          {title}
        </div>
        <div className="text-[15px] font-semibold leading-[18px] text-black">
          {resolvedRent ? `${resolvedRent} kr/månad` : "-"}
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
    </button>
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
  Pick<
    ListingApplicationRowProps,
    | "hasOffer"
    | "isProcessingOffer"
    | "onAcceptOffer"
    | "onRejectOffer"
    | "onWithdraw"
    | "onOpen"
  >
> = ({
  hasOffer,
  isProcessingOffer,
  onAcceptOffer,
  onRejectOffer,
  onWithdraw,
  onOpen,
}) => (
  <div className="flex flex-col items-center gap-2">
    <Button
      type="button"
      onClick={onOpen}
      className={clsx(
        "h-9 w-25 rounded-full bg-[#004225] text-[12px] font-medium text-white",
        "transition hover:bg-[#00331b]"
      )}
    >
      Visa annons
    </Button>
    {hasOffer ? (
      <div className="flex flex-col items-center gap-1.5">
        <Button
          type="button"
          size="sm"
          isDisabled={isProcessingOffer}
          onClick={onAcceptOffer}
          className="h-8 min-w-[104px] rounded-full bg-emerald-600 px-3 text-[12px] font-medium text-white transition hover:bg-emerald-700"
        >
          Acceptera
        </Button>
        <button
          type="button"
          disabled={isProcessingOffer}
          onClick={onRejectOffer}
          className="text-[12px] text-red-600 transition hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Neka
        </button>
      </div>
    ) : onWithdraw ? (
      <button
        type="button"
        onClick={onWithdraw}
        className="flex items-center gap-1.5 text-[12px] text-red-600 hover:text-red-800 transition"
      >
        <Trash2 size={14} />
        Dra tillbaka
      </button>
    ) : null}
  </div>
);

export const buildListingApplicationRow = (props: ListingApplicationRowProps): ListFrameRow => {
  const {
    listingId,
    tags,
    status,
    applicationDate,
    hasOffer,
    isProcessingOffer,
    onAcceptOffer,
    onRejectOffer,
    onWithdraw,
    onOpen,
  } = props;

  return {
    id: listingId,
    cells: [
      <AdCell key={`${listingId}-ad`} listing={props} onOpen={onOpen} />,
      <TagsCell key={`${listingId}-tags`} tags={tags} />,
      <StatusCell key={`${listingId}-status`} status={status} />,
      <DateCell key={`${listingId}-date`} date={applicationDate} />,
      <ActionsCell
        key={`${listingId}-actions`}
        hasOffer={hasOffer}
        isProcessingOffer={isProcessingOffer}
        onAcceptOffer={onAcceptOffer}
        onRejectOffer={onRejectOffer}
        onWithdraw={onWithdraw}
        onOpen={onOpen}
      />,
    ],
  };
};

export default buildListingApplicationRow;
