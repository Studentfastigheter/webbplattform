"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, EyeOff } from "@/components/icons";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

export interface PartnerItem {
  name: string;
  description: string;
  logoSrc: string;
  href: string;
  isPlaceholder?: boolean;
}

interface PartnerGridProps {
  id?: string;
  title: string;
  description?: string;
  subDescription?: string;
  partners: PartnerItem[];
  columns?: 2 | 3 | 4;
  variant?: "default" | "founding" | "housing";
}

export const PartnerGrid = ({
  id,
  title,
  description,
  subDescription,
  partners,
  columns = 3,
  variant = "default",
}: PartnerGridProps) => {
  const { locale, localizedHref } = useI18n();
  const isFoundingVariant = variant === "founding";
  const isHousingVariant = variant === "housing";
  const getLogoSrc = (logoSrc: string) => {
    if (logoSrc.startsWith("http") || logoSrc.startsWith("/")) {
      return logoSrc;
    }

    return `/logos/${logoSrc}`;
  };

  const sectionClasses = isFoundingVariant
    ? "py-24 px-6 bg-primary"
    : "py-24 px-6 bg-background";

  const gridColsClass =
    columns === 4
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 xl:gap-9"
      : columns === 2
        ? "grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-9"
        : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 xl:gap-9";

  const cardClasses = isFoundingVariant
    ? "group flex h-full min-h-80 flex-col rounded-lg bg-card p-7 shadow-[0_0_20px_rgba(251,191,36,0.35),0_0_6px_rgba(251,191,36,0.25)] transition hover:-translate-y-0.5 hover:shadow-lg"
    : "group flex h-full min-h-80 flex-col rounded-lg border border-border bg-card p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";
  const housingCardClasses =
    "group flex h-full min-h-80 flex-col rounded-lg border border-border border-t-4 border-t-primary/70 bg-card p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md";

  return (
    <section id={id} className={`${sectionClasses} scroll-mt-28`}>
      <div className="max-w-[88rem] mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-14">

          <h2
            className={`text-4xl md:text-5xl font-bold tracking-tight ${
              isFoundingVariant ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            {title}
          </h2>
          {description && (
            <p
              className={`mt-6 whitespace-pre-line text-lg leading-relaxed ${
                isFoundingVariant ? "text-primary-foreground/80" : "text-muted-foreground"
              }`}
            >
              {description}
            </p>
          )}
          {subDescription && (
            <p
              className={`text-lg leading-relaxed mt-4 ${
                isFoundingVariant ? "text-primary-foreground/80" : "text-muted-foreground"
              }`}
            >
              {subDescription}
            </p>
          )}
        </div>

        <div className={gridColsClass}>
          {isHousingVariant ? (
            partners.map((partner) => {
              const partnerDescription = partner.description.trim();

              return (
                <div
                  key={partner.name}
                  className={housingCardClasses}
                >
                  <div className="flex h-32 shrink-0 items-center justify-center px-4">
                    {partner.logoSrc ? (
                      <img
                        src={getLogoSrc(partner.logoSrc)}
                        alt={localizedText(locale, `${partner.name} logotyp`, `${partner.name} logo`)}
                        className="max-h-24 max-w-full object-contain sm:max-w-[15rem]"
                      />
                    ) : (
                      <span className="text-xl font-bold text-muted-foreground/60">
                        {partner.name}
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex flex-1 flex-col">
                    <h3 className="text-xl font-bold leading-tight text-foreground">
                      {partner.name}
                    </h3>

                    {partnerDescription && (
                      <p className="mt-4 text-sm leading-6 text-muted-foreground">
                        {partnerDescription}
                      </p>
                    )}

                    <div className="mt-auto pt-7">
                      <Link
                        href={localizedHref(partner.href)}
                        {...(partner.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                        className="inline-flex items-center text-sm font-bold uppercase tracking-normal text-foreground transition hover:text-primary"
                      >
                        {localizedText(locale, "LÄS MER", "READ MORE")}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : partners.map((partner, index) => {
            const isPlaceholder = partner.isPlaceholder;
            const partnerDescription = partner.description.trim();

            return (
              <div
                key={partner.name || `placeholder-${index}`}
                className={
                  isPlaceholder
                    ? `${cardClasses} items-center justify-center border border-dashed border-amber-300/70 bg-card/85 text-center shadow-[0_0_14px_rgba(251,191,36,0.18)]`
                    : cardClasses
                }
                style={
                  isFoundingVariant && !isPlaceholder
                    ? {
                        border: "2px solid transparent",
                        backgroundImage:
                          "linear-gradient(var(--card), var(--card)), linear-gradient(145deg, #d4a017, #f5d778, #b8860b, #f5d778, #d4a017)",
                        backgroundOrigin: "border-box",
                        backgroundClip: "padding-box, border-box",
                      }
                    : undefined
                }
              >
                {isPlaceholder ? (
                  <div className="flex min-h-64 flex-col items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/60 bg-amber-50 text-amber-700">
                      <EyeOff className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 text-xl font-bold text-foreground">
                      {localizedText(locale, "Presenteras snart", "Revealed soon")}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                      {localizedText(
                        locale,
                        "Fler grundande partners visas här när de är redo att presenteras.",
                        "More founding partners will appear here when they are ready to be presented.",
                      )}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex h-32 shrink-0 items-center justify-center px-4">
                      {partner.logoSrc ? (
                        <img
                          src={getLogoSrc(partner.logoSrc)}
                          alt={localizedText(locale, `${partner.name} logotyp`, `${partner.name} logo`)}
                          className="max-h-24 max-w-full object-contain sm:max-w-[15rem]"
                        />
                      ) : (
                        <span className="text-xl font-bold text-muted-foreground/60">
                          {partner.name}
                        </span>
                      )}
                    </div>

                    <div className="mt-6 flex flex-1 flex-col">
                      <h3 className="text-xl font-bold leading-tight text-foreground">
                        {partner.name}
                      </h3>

                      {partnerDescription && (
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">
                          {partnerDescription}
                        </p>
                      )}

                      <div className="mt-auto pt-7">
                        <Link
                          href={localizedHref(partner.href)}
                          {...(partner.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                          className="inline-flex items-center text-sm font-bold uppercase tracking-normal text-foreground transition hover:text-primary"
                        >
                          {partner.href.startsWith("/")
                            ? localizedText(locale, "KONTAKTA OSS", "CONTACT US")
                            : localizedText(locale, "LÄS MER", "READ MORE")}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
