import React from "react";
import { Share2, Heart, Home, MapPin, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Tag from "@/components/ui/Tag";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export type SavedListingRowProps = {
  listingId: string;
  title: string;
  rent?: number | null;
  area?: string | null;
  city?: string | null;
  dwellingType?: string | null;
  rooms?: number | null;
  sizeM2?: number | null;
  landlordLabel?: string | null;
  imageUrl?: string | null;
  tags?: string[] | null;
  verified?: boolean;
  onOpen?: () => void;
  onShare?: () => void;
  onToggleLike?: () => void;
  onExpressInterest?: () => void;
};

const formatCurrency = (value?: number | null) =>
  typeof value === "number"
    ? `${new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(value)} kr/manad`
    : "Pris saknas";

export function SavedListingRow({
  title,
  rent,
  area,
  city,
  dwellingType,
  rooms,
  sizeM2,
  landlordLabel,
  imageUrl,
  tags,
  verified,
  onOpen,
  onShare,
  onToggleLike,
  onExpressInterest,
}: SavedListingRowProps) {
  const locationLabel = [area, city].filter(Boolean).join(", ") || "Okand plats";
  const specLabel = [dwellingType, rooms ? `${rooms} rum` : null, sizeM2 ? `${sizeM2} m\u00b2` : null]
    .filter(Boolean)
    .join(" / ");
  const resolvedLandlord = landlordLabel ?? "Hyresvard";
  const pills = tags ?? [];

  return (
    <div
      className="flex items-start gap-4 rounded-2xl border bg-white p-4 shadow-sm transition hover:bg-muted/50 hover:shadow-md"
      role="article"
    >
      <button
        type="button"
        onClick={onOpen}
        className="h-[110px] w-[140px] flex-shrink-0 overflow-hidden rounded-xl border bg-gray-100"
      >
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            Ingen bild
          </div>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 flex-col items-start gap-1">
            {verified && (
              <Tag
                text="Verifierad hyresvard"
                bgColor="#0F4D0F"
                textColor="#FFFFFF"
                height={18}
                horizontalPadding={10}
                className="mb-1 inline-flex text-[11px] leading-[13px]"
              />
            )}
            <div className="text-base font-semibold leading-tight text-foreground">{title}</div>
            <div className="text-[15px] font-semibold text-foreground">{formatCurrency(rent)}</div>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} strokeWidth={2} />
                {locationLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <Home size={14} strokeWidth={2} />
                {specLabel || "Okand typ"}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 size={14} strokeWidth={2} />
                {resolvedLandlord}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <IconButton icon={Share2} label="Dela" onClick={onShare} />
              <IconButton icon={Heart} label="Like" onClick={onToggleLike} />
            </div>
            <Button
              type="button"
              size="xs"
              variant="default"
              onClick={onExpressInterest}
            >
              Intresseanmäl
            </Button>
          </div>
        </div>

        {pills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pills.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-muted-foreground/20 bg-muted px-3 py-1 text-xs font-medium text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function IconButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-muted-foreground/30 bg-white text-foreground",
        "transition hover:bg-muted"
      )}
    >
      <Icon size={18} />
    </button>
  );
}

export default SavedListingRow;
