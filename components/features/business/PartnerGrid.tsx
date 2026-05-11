"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionBadge } from "@/components/ui/section-badge";

export interface PartnerItem {
  name: string;
  category: string;
  description: string;
  logoSrc: string;
  href: string;
}

interface PartnerGridProps {
  title: string;
  description: string;
  subDescription?: string;
  partners: PartnerItem[];
  badgeText?: string;
  columns?: 3 | 4;
  variant?: "default" | "founding";
}

export const PartnerGrid = ({
  title,
  description,
  subDescription,
  partners,
  badgeText = "Våra partners",
  columns = 3,
  variant = "default",
}: PartnerGridProps) => {
  const isFoundingVariant = variant === "founding";

  const sectionClasses = isFoundingVariant
    ? "py-24 px-6 bg-primary"
    : "py-24 px-6 bg-background";

  const gridColsClass =
    columns === 4
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";

  const cardClasses = isFoundingVariant
    ? "rounded-xl p-8 flex flex-col h-full transition-shadow shadow-[0_0_20px_rgba(251,191,36,0.35),0_0_6px_rgba(251,191,36,0.25)] hover:shadow-lg"
    : "bg-card rounded-xl border border-border p-8 flex flex-col h-full transition-shadow hover:shadow-lg";

  return (
    <section className={sectionClasses}>
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-20">

          <h2
            className={`text-4xl md:text-5xl font-bold mb-8 tracking-tight ${
              isFoundingVariant ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            {title}
          </h2>
          <p
            className={`text-lg leading-relaxed ${
              isFoundingVariant ? "text-primary-foreground/80" : "text-muted-foreground"
            }`}
          >
            {description}
          </p>
          {subDescription && (
            <p
              className={`text-lg leading-relaxed mt-4 ${
                isFoundingVariant ? "text-primary-foreground/80" : "text-muted-foreground"
              }`}
            >
              {subDescription}
            </p>
          )}
          {isFoundingVariant && (
            <Link
              href="/for-foretag#bokning"
              className="mt-8 inline-flex rounded-full px-8 py-3 text-base font-semibold transition hover:opacity-90"
              style={{
                border: "2px solid #d4a017",
                background: "transparent",
                color: "#d4a017",
              }}
            >
              Bli partner
            </Link>
          )}
        </div>

        <div className={gridColsClass}>
          {partners.map((partner, index) => (
            <div
              key={index}
              className={cardClasses}
              style={
                isFoundingVariant
                  ? {
                      border: "4px solid transparent",
                      backgroundImage:
                        "linear-gradient(var(--card), var(--card)), linear-gradient(145deg, #d4a017, #f5d778, #b8860b, #f5d778, #d4a017)",
                      backgroundOrigin: "border-box",
                      backgroundClip: "padding-box, border-box",
                    }
                  : undefined
              }
            >
              <div className="mb-6">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  {partner.category}
                </span>
                <div className="mt-4 h-px bg-border w-full"></div>
              </div>

              <div className="h-32 flex items-center justify-center mb-8 px-4">
                {partner.logoSrc ? (
                  <img
                    src={partner.logoSrc.startsWith("http") ? partner.logoSrc : `/logos/${partner.logoSrc}`}
                    alt={`${partner.name} logotyp`}
                    className="max-h-full w-auto object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground/60">
                    {partner.name}
                  </span>
                )}
              </div>

              <div className="flex-grow">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {partner.name}
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed mb-8">
                  {partner.description}
                </p>
              </div>

              <div className="mt-auto">
                <Link
                  href={partner.href}
                  {...(partner.href.startsWith("http") ? { target: "_blank" } : {})}
                  className="group inline-flex items-center text-sm font-bold text-foreground hover:text-foreground transition-colors"
                >
                  {partner.href.startsWith("/") ? "KONTAKTA OSS" : "LÄS MER"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
