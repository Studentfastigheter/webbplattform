import React from "react";
import clsx from "clsx";
import { ChevronRight, Home, MapPin, Ruler, Trash2 } from "@/components/icons";
import CompanyLogo from "@/components/shared/CompanyLogo";
import Tag from "@/components/ui/Tag";
import type { ListFrameRow } from "@/components/layout/ListFrame";
import { Button } from "@/components/ui/button";
import StatusTag, { type Status } from "@/components/ui/statusTag";
import type { AdvertiserSummary, DateString } from "@/types";
import type { ListingTagDTO } from "@/types/listing";
import { useI18n } from "@/i18n/I18nProvider";
import { formatLocalizedNumber, localizedText } from "@/i18n/text";

type ListingSummary = {
  listingId: string;
  title: string;
  area?: string | null;
  city?: string | null;
  dwellingType?: string | null;
  rooms?: number | null;
  sizeM2?: number | null;
  rent?: number | null;
  tags?: Array<string | ListingTagDTO> | null;
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

const AdCell: React.FC<{ listing: ListingSummary; onOpen?: () => void }> = ({
  listing,
  onOpen,
}) => {
  const { locale } = useI18n();
  const {
    title,
    rent,
    area,
    city,
    dwellingType,
    rooms,
    sizeM2,
    images,
    imageUrl,
    advertiser,
    landlordType,
  } = listing;

  const resolvedImage = imageUrl || images?.find((image) => image.imageUrl)?.imageUrl;
  const resolvedRent =
    typeof rent === "number" ? formatLocalizedNumber(locale, rent) : null;
  const locationLabel = [area, city].filter(Boolean).join(", ") || "-";
  const landlordName =
    advertiser?.displayName ??
    landlordType ??
    localizedText(locale, "Hyresvärd", "Landlord");
  const landlordLogo = advertiser?.logoUrl;
  const details = [
    dwellingType,
    rooms != null ? `${rooms} ${localizedText(locale, "rum", "rooms")}` : null,
    sizeM2 != null ? `${sizeM2} m²` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-w-0 items-start gap-4 text-left transition hover:opacity-95"
    >
      <div className="relative h-32 w-44 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-black/5">
        {resolvedImage ? (
          <img
            src={resolvedImage}
            alt={title}
            className="block h-full min-h-full w-full min-w-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            <Home className="h-7 w-7" />
          </div>
        )}
      </div>
      <div className="flex min-h-32 min-w-0 flex-col justify-start py-1">
        <div className="truncate text-[15px] font-semibold leading-5 text-gray-950">
          {title}
        </div>
        <div className="mt-1.5 inline-flex min-w-0 items-center gap-1.5 text-xs leading-4 text-gray-500">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{locationLabel}</span>
        </div>
        <div className="mt-1 inline-flex min-w-0 items-center gap-1.5 text-xs leading-4 text-gray-500">
          <Ruler className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">
            {details || localizedText(locale, "Bostadsinfo saknas", "Housing info missing")}
          </span>
        </div>
        <div className="mt-2 text-sm font-semibold leading-5 text-gray-950">
          {resolvedRent
            ? localizedText(locale, `${resolvedRent} kr/månad`, `SEK ${resolvedRent}/month`)
            : landlordName}
        </div>
        <div className="mt-auto flex min-w-0 items-center gap-2 pt-2">
          <CompanyLogo
            src={landlordLogo}
            alt={landlordName}
            name={landlordName}
            className="h-6 w-6 flex-shrink-0 rounded-md bg-gray-50 ring-0"
            imageClassName="p-0.5"
            fallback={<Home className="h-3.5 w-3.5 text-gray-400" />}
          />
          <span className="truncate text-xs font-medium leading-4 text-gray-600">
            {landlordName}
          </span>
        </div>
      </div>
    </button>
  );
};

const TagsCell: React.FC<{ tags?: ListingApplicationRowProps["tags"] }> = ({
  tags,
}) => {
  const safeTags = (tags ?? []).slice(0, 2);
  const getTagLabel = (tag: string | ListingTagDTO) =>
    typeof tag === "string" ? tag : tag.displayName || tag.tagKey || "";

  return (
    <div className="flex min-h-16 items-center">
      {safeTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {safeTags.map((tag) => {
            const label = getTagLabel(tag);
            return label ? (
              <Tag
                key={label}
                text={label}
                height={24}
                horizontalPadding={10}
                fontSize={12}
                fontWeight={500}
                className="border-gray-200 bg-gray-50 text-gray-700"
              />
            ) : null;
          })}
        </div>
      ) : (
        <span className="text-sm text-gray-400">-</span>
      )}
    </div>
  );
};

const StatusCell: React.FC<{ status: Status }> = ({ status }) => (
  <div className="flex min-h-16 items-center justify-center">
    <StatusTag
      status={status}
      height={24}
      horizontalPadding={12}
      className="text-[12px] font-medium"
    />
  </div>
);

const DateCell: React.FC<{ date: DateString }> = ({ date }) => (
  <div className="flex min-h-16 items-center text-left text-sm text-gray-700">
    {date}
  </div>
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
}) => {
  const { locale } = useI18n();

  return (
    <div className="flex min-h-16 flex-col items-center justify-center gap-2">
    <Button
      type="button"
      onClick={onOpen}
      className={clsx(
        "h-8 rounded-full border border-gray-200 bg-white px-2.5 text-[12px] font-medium text-gray-900 shadow-sm",
        "transition hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      {localizedText(locale, "Visa", "View")}
      <ChevronRight className="ml-1 h-3.5 w-3.5" />
    </Button>
    {hasOffer ? (
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          isDisabled={isProcessingOffer}
          onClick={onAcceptOffer}
          className="h-8 rounded-full bg-emerald-600 px-3 text-[12px] font-medium text-white transition hover:bg-emerald-700"
        >
          {localizedText(locale, "Acceptera", "Accept")}
        </Button>
        <button
          type="button"
          disabled={isProcessingOffer}
          onClick={onRejectOffer}
          className="text-[12px] text-red-600 transition hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {localizedText(locale, "Neka", "Reject")}
        </button>
      </div>
    ) : onWithdraw ? (
      <button
        type="button"
        onClick={onWithdraw}
        className="flex items-center gap-1.5 text-[12px] text-red-600 transition hover:text-red-800"
      >
        <Trash2 size={14} />
        {localizedText(locale, "Dra tillbaka", "Withdraw")}
      </button>
    ) : null}
    </div>
  );
};

export const buildListingApplicationRow = (
  props: ListingApplicationRowProps
): ListFrameRow => {
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
    className: "items-center transition-colors hover:bg-gray-50/70",
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
