"use client";

import { BookingSection } from "@/components/features/business/BookingSection";
import { PartnerGrid } from "@/components/features/business/PartnerGrid";
import { TrustHero } from "@/components/features/business/PartnerHero";
import { housingPartners } from "@/data/partners";

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <TrustHero />
      <PartnerGrid
        title="Bostadsföretag"
        description="Vi samarbetar med Sveriges ledande bostadsbolag och stiftelser för att samla alla lediga studentbostäder på ett ställe."
        partners={housingPartners}
      />
      <BookingSection
        title="Nyfiken på att höra mer?"
        description="Vi berättar gärna mer"
      />
    </main>
  );
}
