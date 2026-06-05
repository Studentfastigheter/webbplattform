"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, EyeOff } from "lucide-react";
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
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      : columns === 2
        ? "grid grid-cols-1 md:grid-cols-2 gap-8"
        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";

  const cardClasses = isFoundingVariant
    ? "rounded-xl p-8 flex flex-col h-full transition-shadow shadow-[0_0_20px_rgba(251,191,36,0.35),0_0_6px_rgba(251,191,36,0.25)] hover:shadow-lg"
    : "bg-card rounded-xl border border-border p-8 flex flex-col h-full transition-shadow hover:shadow-lg";
  const housingCardClasses =
    "group flex h-full min-h-72 flex-col rounded-lg border border-border border-t-4 border-t-primary/70 bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md";

  return (
    <section id={id} className={`${sectionClasses} scroll-mt-28`}>
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-14">

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
            partners.map((partner) => (
              <div
                key={partner.name}
                className={housingCardClasses}
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24">
                    {partner.logoSrc ? (
                      <img
                        src={getLogoSrc(partner.logoSrc)}
                        alt={localizedText(locale, `${partner.name} logotyp`, `${partner.name} logo`)}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground/60">
                        {partner.name}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pt-2">
                    <h3
                      className="text-xl font-bold leading-tight text-foreground"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {partner.name}
                    </h3>
                    <Link
                      href={localizedHref(partner.href)}
                      {...(partner.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="mt-3 inline-flex items-center text-sm font-semibold text-primary transition hover:underline"
                    >
                      {localizedText(locale, "Läs mer", "Read more")}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

                <div className="mt-5 flex-1 border-t border-border/70 pt-5">
                  <p
                    className="text-sm leading-6 text-muted-foreground"
                    style={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {partner.description}
                  </p>
                </div>
              </div>
            ))
          ) : partners.map((partner, index) => {
            const isPlaceholder = partner.isPlaceholder;

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
                    <p className="mt-3 max-w-64 text-sm leading-6 text-muted-foreground">
                      {localizedText(
                        locale,
                        "Fler grundande partners visas här när de är redo att presenteras.",
                        "More founding partners will appear here when they are ready to be presented.",
                      )}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="h-32 flex items-center justify-center mb-8 px-4">
                      {partner.logoSrc ? (
                        <img
                          src={getLogoSrc(partner.logoSrc)}
                          alt={localizedText(locale, `${partner.name} logotyp`, `${partner.name} logo`)}
                          className="max-h-full w-auto object-contain"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-muted-foreground/60">
                          {partner.name}
                        </span>
                      )}
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-foreground mb-3">{partner.name}</h3>
                      <p className="text-muted-foreground text-base leading-relaxed mb-8">{partner.description}</p>
                    </div>

                    <div className="mt-auto">
                      <Link
                        href={localizedHref(partner.href)}
                        {...(partner.href.startsWith("http") ? { target: "_blank" } : {})}
                        className="group inline-flex items-center text-sm font-bold text-foreground hover:text-foreground transition-colors"
                      >
                        {partner.href.startsWith("/")
                          ? localizedText(locale, "KONTAKTA OSS", "CONTACT US")
                          : localizedText(locale, "LÄS MER", "READ MORE")}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
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
