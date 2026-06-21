"use client";

import Link from "next/link";
import React from "react";
import { ChevronRight, Plus } from "@/components/icons";
import CompanyLogo from "@/components/shared/CompanyLogo";

import { Button } from "@/components/ui/button";
import { RichTextParagraph } from "@/components/ui/RichText";
import VerifiedTag from "@/components/ui/VerifiedTag";
import type { Tag as TagType } from "@/types";
import { useI18n } from "@/i18n/I18nProvider";

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
  isJoinStatusLoading?: boolean;
  isJoinDisabled?: boolean;
  joinDisabledLabel?: string;
  cardHref?: string;
  onViewListings?: () => void;
  onToggleSelect?: () => void;
};

const Que_ListingCard: React.FC<QueListingCardProps> = (props) => {
  const { t } = useI18n();
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
    isJoinStatusLoading = false,
    isJoinDisabled = false,
    joinDisabledLabel,
    cardHref,
    onViewListings,
    onToggleSelect,
  } = props;
  const fallbackDescription = t("queueCard.fallbackDescription");
  const policyLinks = [
    { label: t("queueCard.terms"), href: termsUrl },
    { label: t("queueCard.privacy"), href: privacyUrl },
  ];

  return (
    <div
      className={`group/card relative flex h-full min-h-[244px] w-full max-w-none flex-col overflow-hidden rounded-[26px] border border-black/[0.05] bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition-all duration-200 hover:border-[#004225]/15 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] sm:min-h-[254px] sm:rounded-[28px] sm:p-5 ${
        isSelected ? "ring-2 ring-[#004225]/20" : ""
      }`}
    >
      {cardHref && (
        <Link
          href={cardHref}
          aria-label={`${t("queueCard.readMore")} ${name}`}
          className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225]"
        />
      )}

      <div className="flex min-w-0 shrink-0 items-start gap-3 sm:gap-4">
        <div className="flex h-16 w-[76px] shrink-0 items-center justify-center rounded-2xl bg-white sm:h-[82px] sm:w-[96px] sm:pr-4">
          <CompanyLogo
            src={logoUrl}
            alt={logoAlt ?? name}
            name={name}
            className="h-16 w-16 rounded-2xl bg-white ring-0 sm:h-[82px] sm:w-[82px]"
            imageClassName="p-0"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5 pt-1.5 text-left sm:gap-2 sm:pt-2.5">
          <div className="flex min-h-[30px] min-w-0 flex-wrap items-start justify-start gap-2 overflow-hidden">
            <h3
              className="text-[18px] font-semibold leading-[1.18] tracking-tight text-[#111111] sm:text-[19px]"
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
            aria-label={t("queueCard.policyAria", { name })}
            className="relative z-20 flex min-h-[17px] flex-wrap items-center gap-x-2.5 gap-y-1 overflow-hidden text-[12.5px] font-semibold leading-[17px] text-[#004225] sm:gap-x-3 sm:text-[13px]"
          >
            {policyLinks.map((link, index) => (
              <React.Fragment key={link.label}>
                {index > 0 && (
                  <span className="hidden h-4 w-px bg-[#004225]/40 sm:block" />
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

      <RichTextParagraph
        text={description || fallbackDescription}
        className="mt-4 min-h-[42px] shrink-0 text-left text-[14px] font-normal leading-[1.55] text-gray-700 sm:mt-5 sm:text-[15px]"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          wordBreak: "break-word",
        }}
      />

      <div
        className={`relative z-20 mt-auto grid shrink-0 gap-2.5 pt-5 sm:gap-3 sm:pt-6 ${
          cardHref ? "grid-cols-1" : "grid-cols-2"
        }`}
      >
        <Button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (isAlreadyJoined || isJoinStatusLoading || isJoinDisabled) return;
            onToggleSelect?.();
          }}
          size="lg"
          variant="default"
          isDisabled={isAlreadyJoined || isJoinStatusLoading || isJoinDisabled}
          className={`h-auto min-h-10 w-full !min-w-0 !whitespace-normal rounded-full px-2.5 py-2 text-center text-[13px] font-semibold leading-tight shadow-[0_8px_18px_rgba(0,66,37,0.18)] sm:min-h-11 sm:!min-w-0 sm:px-3 sm:text-sm [&>svg]:shrink-0 ${
            isAlreadyJoined || isJoinStatusLoading || isJoinDisabled
              ? "border-gray-200 bg-gray-100 text-gray-500 shadow-none"
              : isSelected
                ? "bg-[#004225] text-white"
                : ""
          }`}
        >
          {isJoinStatusLoading
            ? t("queueCard.checking")
            : isAlreadyJoined
              ? t("queueCard.alreadyJoined")
              : isJoinDisabled
                ? joinDisabledLabel ?? t("queueCard.unavailable")
                : isSelected
                  ? t("queueCard.added")
                  : (
                    <>
                      <Plus className="h-4 w-4 shrink-0" strokeWidth={2.1} />
                      {t("queueCard.join")}
                    </>
                  )}
        </Button>

        {!cardHref && (
          <Button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onViewListings?.();
            }}
            size="lg"
            variant="ghost"
            className="h-auto min-h-10 w-full !min-w-0 !whitespace-normal rounded-full border border-[#004225]/20 bg-white px-2.5 py-2 text-center text-[13px] font-semibold leading-tight text-[#004225] shadow-none transition-colors hover:bg-[#004225]/5 sm:min-h-11 sm:!min-w-0 sm:px-3 sm:text-sm [&>svg]:shrink-0"
          >
            {t("queueCard.readMore")}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Que_ListingCard;
