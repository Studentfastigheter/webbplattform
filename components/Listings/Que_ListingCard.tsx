"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";
import VerifiedTag from "../ui/VerifiedTag";
import type { Tag as TagType } from "@/types";

type QueueSummary = {
  name: string;
  area?: string | null;
  city?: string | null;
  totalUnits?: number | null;
  unitsLabel?: string;
  isVerified?: boolean;
  logoUrl?: string | null;
  logoAlt?: string;
  description?: string | null;
  termsUrl?: string | null;
  privacyUrl?: string | null;
  tags?: TagType[];
};

export type QueListingCardProps = QueueSummary & {
  isSelected?: boolean;
  isAlreadyJoined?: boolean;
  onViewListings?: () => void;
  onToggleSelect?: () => void;
};

const Que_ListingCard: React.FC<QueListingCardProps> = (props) => {
  const {
    name,
    isVerified = false,
    logoUrl,
    logoAlt,
    description,
    termsUrl,
    privacyUrl,
    isSelected = false,
    isAlreadyJoined = false,
    onViewListings,
    onToggleSelect,
  } = props;
  const fallbackDescription =
    "Vi hjälper dig hitta studentboende på ett enkelt och tryggt sätt.";
  const policyLinks = [
    { label: "Villkor", href: termsUrl },
    { label: "Integritetspolicy", href: privacyUrl },
  ];

  return (
    <div
      className={`relative flex h-full min-h-[300px] w-full max-w-none flex-col gap-4 overflow-hidden rounded-[32px] border border-black/[0.04] bg-white px-4 pb-3 pt-4 shadow-md transition-shadow duration-200 hover:shadow-lg sm:min-h-[248px] sm:px-5 sm:pb-4 sm:pt-5 md:min-h-[258px] lg:min-h-[248px] ${
        isSelected ? "ring-2 ring-[#004225]/20" : ""
      }`}
    >
      <div className="grid shrink-0 gap-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-start sm:gap-4 md:grid-cols-[124px_minmax(0,1fr)]">
        <div className="flex h-20 items-center justify-center border-black/[0.04] sm:h-24 sm:border-r sm:pr-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={logoAlt ?? name}
              className="max-h-[76px] w-full max-w-[128px] object-contain"
            />
          ) : (
            <Building2 className="h-10 w-10 text-gray-400" strokeWidth={1.6} />
          )}
        </div>

        <div className="flex min-w-0 flex-col items-start gap-2 pt-3 sm:pt-4 sm:text-left">
          <div className="flex min-w-0 flex-col items-start gap-1">
            <div className="flex min-h-[30px] min-w-0 flex-wrap items-start justify-start gap-2 overflow-hidden">
              <h3
                className="text-[18px] font-normal leading-[23px] text-[#111111]"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  wordBreak: "break-word",
                }}
              >
                {name}
              </h3>
              {isVerified && <VerifiedTag />}
            </div>

            <nav
              aria-label={`${name} policy-länkar`}
              className="flex min-h-[17px] flex-wrap items-center gap-x-4 gap-y-1 overflow-hidden text-[13px] font-medium leading-[17px] text-[#004225]"
            >
              {policyLinks.map((link, index) => (
                <React.Fragment key={link.label}>
                  {index > 0 && (
                    <span className="hidden h-5 w-px bg-[#004225]/70 sm:block" />
                  )}
                  <a
                    href={link.href ?? "#"}
                    aria-disabled={!link.href}
                    onClick={(event) => {
                      if (!link.href) {
                        event.preventDefault();
                      }
                    }}
                    className="rounded-sm underline-offset-4 transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#004225]"
                  >
                    {link.label}
                  </a>
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <p
        className="min-h-[38px] shrink-0 text-left text-[14px] font-normal leading-[19px] text-[#202020]"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          wordBreak: "break-word",
        }}
      >
        {description || fallbackDescription}
      </p>

      <div className="mt-1 grid shrink-0 grid-cols-1 gap-2.5 sm:mt-2 sm:grid-cols-2 sm:gap-3">
        <Button
          type="button"
          onClick={e => {
            e.stopPropagation();
            if (isAlreadyJoined) return;
            onToggleSelect?.();
          }}
          size="lg"
          variant="default"
          isDisabled={isAlreadyJoined}
          className={`h-auto min-h-9 w-full min-w-0 whitespace-normal rounded-full px-4 py-2 text-center text-sm font-semibold leading-tight shadow-[0_6px_14px_rgba(0,0,0,0.18)] ${
            isAlreadyJoined
              ? "border-gray-200 bg-gray-100 text-gray-500 shadow-none"
              : isSelected
                ? "bg-[#004225] text-white"
              : ""
          }`}
        >
          {isAlreadyJoined
            ? "Du står redan i kön"
            : isSelected
              ? "Tillagd"
              : (
                <>
                  <Plus className="h-4 w-4" strokeWidth={2.1} />
                  Gå med
                </>
              )}
        </Button>

        <Button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onViewListings?.();
          }}
          size="lg"
          variant="ghost"
          className="h-auto min-h-9 w-full min-w-0 whitespace-normal px-4 py-2 text-center text-sm font-semibold leading-tight text-[#004225] shadow-none hover:bg-transparent hover:opacity-75"
        >
          Läs mer
        </Button>
      </div>
    </div>
  );
};

export default Que_ListingCard;
