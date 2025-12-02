"use client";

import React from "react";

export type QueuePopupData = {
  id: string;
  name: string;
  city: string;
  area?: string;
  landlord: string;
  logoUrl?: string;
  totalUnits?: number;
  unitsLabel?: string;
  isVerified?: boolean;
  status?: "open" | "queue";
  tags?: string[];
};

type QueueMapPopupProps = {
  queue: QueuePopupData;
  onOpen?: (id: string) => void;
};

const formatUnits = (totalUnits?: number, unitsLabel?: string) => {
  if (unitsLabel) return unitsLabel;
  if (typeof totalUnits === "number") {
    return `${totalUnits.toLocaleString("sv-SE")} bostäder`;
  }
  return null;
};

const statusLabel = (status?: "open" | "queue") => {
  if (status === "open") return "Öppen kö";
  if (status === "queue") return "Kö krävs";
  return null;
};

const QueueMapPopup: React.FC<QueueMapPopupProps> = ({ queue, onOpen }) => {
  const unitsText = formatUnits(queue.totalUnits, queue.unitsLabel);
  const statusText = statusLabel(queue.status);

  const handleOpen = () => onOpen?.(queue.id);
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
      className="w-[260px] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      {/* Header med logo + namn + plats */}
      <div className="flex items-start gap-3 px-4 pt-3.5 pb-2.5">
        <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {queue.logoUrl ? (
            <img
              src={queue.logoUrl}
              alt={queue.name}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500">
              {queue.name.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-gray-900">
              {queue.name}
            </p>
            {queue.isVerified && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Verifierad
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-gray-500">
            {queue.area ? `${queue.area}, ${queue.city}` : queue.city}
          </p>
          <p className="mt-0.5 text-[11px] text-gray-500">{queue.landlord}</p>
        </div>
      </div>

      {/* Status, tags, volym */}
      <div className="space-y-2 px-4 pb-3 text-[11px]">
        <div className="flex flex-wrap gap-1">
          {statusText && (
            <span
              className={
                queue.status === "open"
                  ? "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700"
                  : "inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700"
              }
            >
              {statusText}
            </span>
          )}
          {queue.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {unitsText && (
          <p className="text-[11px] text-gray-500">{unitsText}</p>
        )}
      </div>

      {/* CTA-rad */}
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <p className="text-[11px] text-gray-400">Se köregler & bostäder</p>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleOpen();
          }}
          className="inline-flex items-center justify-center rounded-full bg-gray-900 px-3.5 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-black"
        >
          Visa kö
        </button>
      </div>
    </div>
  );
};

export default QueueMapPopup;
