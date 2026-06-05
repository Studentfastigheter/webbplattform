"use client";

import { PartnerGrid } from "@/features/marketing/components/business/PartnerGrid";
import { TrustHero } from "@/features/marketing/components/business/PartnerHero";
import { foundingPartners, housingPartners, otherPartners } from "@/data/partners";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

export default function PartnersPage() {
  const { locale } = useI18n();

  return (
    <main className="main-marketing-theme min-h-screen bg-background text-foreground">
      <TrustHero />

      {foundingPartners.length > 0 && (
        <PartnerGrid
          id="grundande-partners"
          title={localizedText(locale, "Grundande partners", "Founding partners")}
          description={localizedText(
            locale,
            "Våra grundande partners var med från start och hjälpte CampusLyan ta form.\nMed sitt förtroende lade de grunden för en enklare väg till studentbostäder.",
            "Our founding partners were with us from the start and helped CampusLyan take shape.\nTheir trust laid the foundation for a simpler path to student housing.",
          )}
          partners={foundingPartners}
          columns={3}
          variant="founding"
        />
      )}

      {housingPartners.length > 0 && (
        <PartnerGrid
          id="bostadsforetag"
          title={localizedText(locale, "Bostadsföretag", "Housing companies")}
          partners={housingPartners}
          columns={3}
          variant="housing"
        />
      )}

      {otherPartners.length > 0 && (
        <PartnerGrid
          id="ovriga-partners"
          title={localizedText(locale, "Övriga partners", "Other partners")}
          partners={otherPartners}
          columns={3}
          variant="housing"
        />
      )}
    </main>
  );
}
