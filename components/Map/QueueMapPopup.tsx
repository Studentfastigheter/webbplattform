"use client";

import React from "react";
import {
  type AdvertiserSummary,
  type HousingQueue,
  type QueueId,
  type UrlString,
} from "@/types";

type QueueMapPopupData = Pick<HousingQueue, "queueId" | "name" | "totalUnits"> & {
  advertiser: AdvertiserSummary;
  logoUrl?: UrlString | null;
  unitsLabel?: string | null;
};

type QueueMapPopupProps = {
  queue: QueueMapPopupData;
  onOpen?: (id: QueueId) => void;
};

const formatUnits = (totalUnits?: number | null, unitsLabel?: string | null) => {
  if (unitsLabel) return unitsLabel;
  if (typeof totalUnits === "number") {
    return `${totalUnits.toLocaleString("sv-SE")} bostäder`;
  }
  return "–";
};

const QueueMapPopup: React.FC<QueueMapPopupProps> = ({ queue, onOpen }) => {
  const unitsText = formatUnits(queue.totalUnits, queue.unitsLabel);
  const logoSource = queue.logoUrl ?? queue.advertiser.logoUrl ?? null;

  const handleOpen = () => onOpen?.(queue.queueId);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpen();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className="
        w-[220px] cursor-pointer overflow-hidden rounded-2xl
        border border-slate-200 bg-white shadow-lg ring-1 ring-black/5
        transition hover:-translate-y-[2px]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
        focus-visible:ring-offset-2 focus-visible:ring-offset-white
      "
    >
      <div className="flex items-center gap-3 px-3.5 py-3">
        {/* Logo */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-inner ring-1 ring-black/5">
          {logoSource ? (
            <img
              src={logoSource}
              alt={queue.name}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          ) : (
            <span className="text-xs font-semibold text-slate-500">
              {queue.name?.charAt(0) ?? "?"}
            </span>
          )}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {queue.name}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-600">
            {unitsText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QueueMapPopup;
