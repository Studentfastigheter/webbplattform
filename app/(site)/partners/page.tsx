"use client";

import React from "react";
import { TrustHero } from "@/components/for-foretag-sections/PartnerHero";
import { CtaSection } from "@/components/for-foretag-sections/CtaSection";
// Importera din komponent och typen
import { PartnerGrid, PartnerItem } from "@/components/for-foretag-sections/PartnerGrid";

// --- 1. BILD FÖR CTA (Dashboard Preview) ---
const dashboardPreview = (
    <svg width="100%" height="100%" viewBox="0 0 600 450" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl transform md:translate-x-10 translate-y-4">

    </svg>
  );

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
  {
    id: 2,
    name: "Guldhedens Studiehem",
    city: "Göteborg",
    website: "https://www.guldheden.com",
    logoUrl: "/logos/guldhedens_studiehem.png",
    description: "",
  },
];

const schoolPartners: PartnerItem[] = [
  {
    name: "Chalmers Studentkår",
    category: "Studentkår",
    description: "Vi arbetar tätt ihop med kåren för att säkerställa att nya studenter hittar boende inför terminsstart.",
    logoSrc: "",
    href: "#",
  },
];

const marketPartners: PartnerItem[] = [
  {
    name: "Mecenat",
    category: "Marknadspartner",
    description: "Samarbete kring studentrabatter och unika erbjudanden kopplade till boende.",
    logoSrc: "",
    href: "#",
  },
  {
    name: "Hyresgästföreningen",
    category: "Kampanjpartner",
    description: "Gemensamma kampanjer för trygghet och rättigheter i boendet för unga vuxna.",
    logoSrc: "",
    href: "#",
  },
];

// --- 3. SIDANS LAYOUT ---

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-white">
      
      {/* Hero */}
      <TrustHero/>

      {/* SEKTION 1: Bostadsföretag */}
      <PartnerGrid 
        title="Bostadsföretag"
        description="Vi samarbetar med Sveriges ledande bostadsbolag och stiftelser för att samla alla lediga studentbostäder på ett ställe."
        partners={housingPartners}
      />

      {/* SEKTION 2: Skolor & Kårer 
          OBS: Jag lade en div runt denna för att få grå bakgrund, 
          eftersom komponenten inte har en backgroundColor prop just nu. 
      
      <div className="bg-slate-50 border-y border-gray-100">
        <PartnerGrid 
          title="Skolor & Kårer"
          description="Tillsammans med lärosäten och studentkårer arbetar vi för att minska bostadsbristen och förenkla flytten till studieorten."
          partners={schoolPartners}
        />
      </div>
*/}
      {/* SEKTION 3: Marknad & Kampanj 
      <PartnerGrid 
        title="Marknad & Kampanj"
        description="Strategiska partnerskap som skapar mervärde för studenter genom unika erbjudanden och trygghetsskapande insatser."
        partners={marketPartners}
      />
*/}
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