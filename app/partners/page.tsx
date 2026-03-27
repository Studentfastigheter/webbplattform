"use client";

import { PartnerGrid } from "@/components/features/business/PartnerGrid";
import { TrustHero } from "@/components/features/business/PartnerHero";
import { foundingPartners, regularPartners, housingPartners } from "@/data/partners";

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <TrustHero />

      {foundingPartners.length > 0 && (
        <PartnerGrid
          title="Bli en grundande partner"
          description="Våra grundande partners är en utvald grupp aktörer som varit med från start och format CampusLyan till vad det är idag. De representerar nytänkande och ligger i framkant inom utvecklingen av studentbostäder i Sverige."
          subDescription="Som grundande partner får ni prioriterad exponering mot studenter genom välkomstbrev, partnersida och sociala kanaler. Ni får även ett strategiskt inflytande över plattformens utveckling och är med och formar framtidens mötesplats för studentbostäder."
          partners={foundingPartners}
          badgeText="Grundare"
          columns={3}
          variant="founding"
        />
      )}

      {regularPartners.length > 0 && (
        <PartnerGrid
          title="Partners"
          description="Våra partners är en noggrant utvald grupp aktörer som aktivt stöttar nya initiativ och för utvecklingen av studentbostäder framåt. De drivs av en tydlig ambition att ligga i framkant och utveckla moderna lösningar för framtidens studentboende."
          partners={regularPartners}
          badgeText="Samarbeten"
          columns={3}
        />
      )}

      <PartnerGrid
        title="Bostadsföretag"
        description="Våra bostadsföretag omfattar etablerade aktörer från hela Sverige som tillsammans erbjuder ett brett utbud av studentbostäder. De representerar stabilitet, kvalitet och erfarenhet, och utgör en viktig del av studenters väg till ett tryggt boende."
        partners={housingPartners}
        badgeText="Bostäder"
        columns={4}
      />

    </main>
  );
}
