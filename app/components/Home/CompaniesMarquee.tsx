"use client";

import { useEffect, useState } from "react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

type Company = { id: number; name: string; city?: string | null; description?: string | null };

type PartnerQuote = { quote: string; name: string; title: string };

const FALLBACK_PARTNERS: PartnerQuote[] = [
  {
    quote: "SGS Studentbostäder i Göteborg finns listade här så att du enkelt kan se lediga lyor och beräknade kötider.",
    name: "SGS Studentbostäder",
    title: "Göteborg",
  },
  {
    quote: "Hitta ditt hem hos SSSB i Stockholm genom CampusLyan. Vi hjälper dig hålla koll på deras senaste släpp.",
    name: "SSSB",
    title: "Stockholm",
  },
  {
    quote: "Vi samlar AF Bostäders utbud i Lund så att du får full koll på allt från korridorsrum till nyproduktion.",
    name: "AF Bostäder",
    title: "Lund",
  },
  {
    quote: "StudentBo och Uppsalas övriga värdar finns tillgängliga i vårt flöde för att du ska hitta rätt direkt.",
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
