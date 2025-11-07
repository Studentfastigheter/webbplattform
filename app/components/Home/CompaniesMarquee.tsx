"use client";

import { useEffect, useState } from "react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

type Company = { id: number; name: string; city?: string | null; description?: string | null };

type PartnerQuote = { quote: string; name: string; title: string };

const FALLBACK_PARTNERS: PartnerQuote[] = [
  {
    quote: "SGS publicerar alla sina studentbostäder direkt i CampusLyan så studenter ser sina ködagar i realtid.",
    name: "SGS Studentbostäder",
    title: "Göteborg",
  },
  {
    quote: "SSSB når KTH-, SU- och KI-studenter i samma flöde och låter dem följa nya annonser steg för steg.",
    name: "SSSB",
    title: "Stockholm",
  },
  {
    quote: "AF Bostäder kombinerar nationsboenden och nyproduktion – allt går via CampusLyan mot Lundastudenter.",
    name: "AF Bostäder",
    title: "Lund",
  },
  {
    quote: "StudentBo samlar privata och kommunala värdar så Uppsalastudenter får notifieringar direkt.",
    name: "StudentBo",
    title: "Uppsala",
  },
];

export default function CompaniesMarquee() {
  const [partners, setPartners] = useState<PartnerQuote[]>(FALLBACK_PARTNERS);

  useEffect(() => {
    fetch("/api/companies", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Company[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const mapped = data
          .map((company) => ({
            quote:
              company?.description?.trim() ||
              "Publicerar via CampusLyan för att nå studenter där de letar.",
            name: company?.name?.trim() || "Studentbostäder",
            title: company?.city?.trim() || "Sverige",
          }))
          .filter((item): item is PartnerQuote => Boolean(item.name));
        if (mapped.length > 0) setPartners(mapped);
      })
      .catch(() => setPartners(FALLBACK_PARTNERS));
  }, []);

  if (partners.length === 0) return null;

  return (
    <section className="section bg-neutral-50">
      <div className="container-page space-y-4 text-center">
        <p className="eyebrow text-brand">Samarbetspartners</p>
        <h2 className="h2">Bostadsbolag och privatvärdar som publicerar via CampusLyan</h2>
        <p className="text-muted max-w-2xl mx-auto">
          De låter studenter följa köer och annonser här – ta del av röster från några av dem.
        </p>
      </div>
      <div className="mt-8 flex justify-center">
        <div className="w-full max-w-5xl">
          <InfiniteMovingCards items={partners} speed="slow" />
        </div>
      </div>
    </section>
  );
}
