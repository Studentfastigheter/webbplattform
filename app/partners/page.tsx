"use client";

import React from "react";
import { TrustHero } from "@/components/for-foretag-sections/PartnerHero";
import { CtaSection } from "@/components/for-foretag-sections/CtaSection";
import { PartnerGrid, PartnerItem } from "@/components/for-foretag-sections/PartnerGrid";
import { Hero } from "@/components/sections/hero";

// --- 1. BILD FÖR CTA (Dashboard Preview) ---
const dashboardPreview = (
  <svg width="100%" height="100%" viewBox="0 0 600 450" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl transform md:translate-x-10 translate-y-4">
    {/* SVG Content here */}
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
    // FIX: Använder semantiska variabler för bakgrund och text
    <main className="min-h-screen text-foreground selection:bg-primary/20 selection:text-primary">
      
      {/* Hero */}
      <Hero
        title="Vi skapar bron mellan studenter och bostadsmarknad."
        features={[
          { label: 'En plattform byggd för studenter, av studenter – i nära samarbete med landets ledande bostadsaktörer.' },
        ]}
        mainImage={{
          src: 'https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/675fd56ee2ebe46fa20c27a6_Devices%20SE.png',
          alt: 'Devices',
        }}
        floatingImages={[
          {
            src: 'https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/67b5e71b79dd9bba8852dd8d_Bento%20card%20vertical%20SE.png',
            alt: 'Boka tvättstuga',
            className: 'top-1/4 -left-10 md:left-0 w-64 transform -rotate-6',
          },
          {
            src: 'https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/67b5e7f28a7f0840c79e9414_Bento%20card%20horizontal%2004%20SE.png',
            alt: 'Betalning',
            className: 'bottom-10 -right-10 md:right-0 w-72 transform rotate-3',
          },
        ]}
      />

      {/* SEKTION 1: Bostadsföretag */}
      <PartnerGrid 
        title="Bostadsföretag"
        description="Vi samarbetar med Sveriges ledande bostadsbolag och stiftelser för att samla alla lediga studentbostäder på ett ställe."
        partners={housingPartners}
      />

      {/* SEKTION 2: Skolor & Kårer 
          OBS: Jag har uppdaterat klasserna här så det funkar om du avkommenterar.
          bg-slate-50 -> bg-secondary/30 (Funkar i dark mode)
          border-gray-100 -> border-border
      
      <div className="bg-secondary/30 border-y border-border">
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
            primaryBtnText="Maila oss"
            primaryBtnLink="mailto:alvin.stallgard@campuslyan.se?subject=Förfrågan om samarbete"
       />

    </main>
  );
}