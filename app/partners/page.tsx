"use client";

import React from "react";
import { TrustHero } from "@/components/for-foretag-sections/PartnerHero";
import { CtaSection } from "@/components/for-foretag-sections/CtaSection";
// Importera din komponent och typen
import { PartnerGrid, PartnerItem } from "@/components/for-foretag-sections/PartnerGrid";

// --- 2. DATA ---

const housingPartners: PartnerItem[] = [
  {
    name: "SGS Studentbostäder",
    category: "Bostadsföretag",
    description: "En av Sveriges största studentbostadsstiftelser som erbjuder trygga hem för tusentals studenter i Göteborg.",
    logoSrc: "sgs-logo.svg", 
    href: "https://sgs.se",
  },
  {
    name: "Guldhedens Studiehem",
    category: "Bostadsföretag",
    description: "Guldhedens Studiehem är beläget i centrala Guldheden med gångavstånd till både Chalmers, Göteborgs Universitet och centrum.",
    logoSrc: "guldhedens_studiehem.png",
    href: "https://www.guldheden.com/",
  },
];

// --- 3. SIDANS LAYOUT ---

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      
      {/* Hero */}
      <TrustHero/>

      {/* SEKTION 1: Bostadsföretag */}
      <PartnerGrid 
        title="Bostadsföretag"
        description="Vi samarbetar med Sveriges ledande bostadsbolag och stiftelser för att samla alla lediga studentbostäder på ett ställe."
        partners={housingPartners}
      />

      {/* CTA med mail-funktion */}
      <CtaSection 
            title="Nyfiken på att höra mer?"
            description="Vi berättar gärna mer"
            primaryBtnText="Maila oss" // Ändrade texten så det är tydligt
            // HÄR ÄR MAGIN:
            primaryBtnLink="mailto:alvin.stallgard@campuslyan.se?subject=Förfrågan om samarbete"
       />

    </main>
  );
}
