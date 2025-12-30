"use client";

import Image from "next/image";
import type { ComponentType } from "react";
import { Typography, type TypographyProps } from "@material-tailwind/react";
import { FaLinkedin, FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa6";
import { SiThreads } from "react-icons/si";
import { HiGlobeAlt } from "react-icons/hi";

const Text = Typography as unknown as ComponentType<Partial<TypographyProps>>;

// --- FÄRGPALETT FRÅN DIN BILD ---
const COLORS = {
  primary: "#004225",    // British Racing Green (Bakgrund)
  white: "#FEFEFE",      // White as Heaven (Rubriker/Ikoner)
  lightText: "#DFDFE2",  // Wayward Wind (Brödtext/Länkar)
  accent: "#708A83",     // Misty Moor (Hover-effekter/Borders)
  darkAccent: "#476E66", // Pond Newt (Sekundär bakgrund vid behov)
};

const SERVICE_LINKS = [
  { href: "/sok-bostad", label: "Sök Bostad" },
  { href: "/for-foretag", label: "För Företag" },
  { href: "/hyra-ut", label: "Hyra ut" },
];

const PARTNER_LINKS = [
  { href: "/partners", label: "Samarbetspartners" },
  { href: "/annonsera", label: "Annonsera" },
];

const COMPANY_LINKS = [
  { href: "/om", label: "Om CampusLyan" },
  { href: "/kundservice", label: "Kundservice & kontakt" },
  { href: "/privacy", label: "Integritet & Cookies" },
];

const SOCIAL_LINKS = [
  { href: "https://www.linkedin.com/company/campuslyan", icon: <FaLinkedin /> },
  { href: "https://www.instagram.com/campuslyanse", icon: <FaInstagram /> },
  { href: "https://www.facebook.com/campuslyan", icon: <FaFacebook /> },
  { href: "https://www.tiktok.com/@campuslyan", icon: <FaTiktok /> },
  { href: "https://www.threads.net/@campuslyan", icon: <SiThreads /> },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    // Bakgrund: British Racing Green
    <footer className="relative w-full mt-24" style={{ backgroundColor: COLORS.primary }}>
      
      {/* --- DECORATION (GoMore Style) --- */}
      <div className="absolute top-0 left-0 right-0 w-full -translate-y-[98%] overflow-hidden leading-[0] z-10">
        <div className="relative w-full h-[80px] sm:h-[120px] lg:h-[160px]">
          {/* Se till att din SVG i public-mappen har fill="#004225" */}
          <Image
            src="/footer-decoration.svg" 
            alt="CampusLyan illustration"
            fill
            className="absolute w-auto h-100 h-200-sm l-50% translate-x-negative-50%"
            priority
          />
        </div>
      </div>

      {/* --- CONTENT (Avy Style) --- */}
      <div className="mx-auto w-full max-w-[1400px] px-6 pb-16 pt-8 sm:px-10 lg:px-16 relative z-20">
        
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          
          {/* VÄNSTER KOLUMN */}
          <div className="flex flex-col gap-8 lg:col-span-5">
            {/* Logo - Filter gör den helvit */}
            <div className="relative h-10 w-40">
               <Image
                src="/campuslyan-logo.svg" 
                alt="CampusLyan"
                width={150}
                height={40}
                className="object-contain brightness-0 invert" 
              />
            </div>

            {/* Beskrivning - Textfärg: Wayward Wind, Border: Misty Moor */}
            <div className="flex gap-4 border-l-2 pl-4" style={{ borderColor: COLORS.accent }}>
              <Text className="max-w-md text-sm font-light leading-relaxed" style={{ color: COLORS.lightText }}>
                Vi gör det enkelt att hitta, jämföra och hyra studentbostäder runt om i landet.
              </Text>
            </div>

            {/* Sociala Ikoner */}
            <div className="flex gap-4 text-lg">
              {SOCIAL_LINKS.map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="transition-colors hover:opacity-80"
                  style={{ color: COLORS.white }}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Nyhetsbrev Box (Avy-stil) */}
            {/* Bakgrund: En mix av vit transparens eller Pond Newt. Här kör vi transparens för modern look. */}
            <div className="mt-4 w-full max-w-md rounded-2xl bg-white/5 p-8 backdrop-blur-sm border" style={{ borderColor: COLORS.accent }}>
              <Text variant="small" className="mb-2 font-bold uppercase tracking-wider" style={{ color: COLORS.white }}>
                Håll dig uppdaterad
              </Text>
              <Text className="mb-6 text-sm font-light" style={{ color: COLORS.lightText }}>
                Få de senaste studentbostäderna och nyheterna direkt i din inkorg.
              </Text>
              <button 
                className="rounded px-6 py-3 text-xs font-bold uppercase tracking-wide transition-colors hover:bg-gray-100"
                style={{ backgroundColor: COLORS.white, color: COLORS.primary }}
              >
                Prenumerera
              </button>
            </div>
          </div>

          {/* HÖGER KOLUMN (Länkar) */}
          <div className="flex flex-col gap-10 lg:col-span-7 lg:pl-10 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              
              {/* Funktion för att rendera länk-listor */}
              {[
                { title: "Tjänster", links: SERVICE_LINKS },
                { title: "Partners", links: PARTNER_LINKS },
                { title: "CampusLyan", links: COMPANY_LINKS }
              ].map((section, idx) => (
                <div key={idx}>
                  <div className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest" style={{ color: COLORS.white }}>
                    <span className="h-4 w-[2px]" style={{ backgroundColor: COLORS.accent }}></span>
                    {section.title}
                  </div>
                  <ul className="flex flex-col gap-3">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <a 
                          href={link.href} 
                          className="text-xs font-bold uppercase tracking-wide transition-colors hover:underline hover:underline-offset-4"
                          style={{ color: COLORS.lightText }}
                          // Hover-färg sätts via klass eller style om man vill vara specifik, här kör vi standard hover effekt
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-20 flex flex-col items-start justify-between border-t pt-6 text-xs font-medium sm:flex-row sm:items-center"
             style={{ borderColor: COLORS.accent, color: COLORS.lightText }}>
          <div>
            Copyright © {year} CampusLyan. Alla rättigheter förbehållna.
          </div>
          
          <div className="mt-4 flex items-center gap-2 cursor-pointer transition-colors hover:text-white sm:mt-0">
            <HiGlobeAlt className="text-lg" />
            <span className="uppercase tracking-wide">Svenska</span>
            <span className="text-[10px]">▼</span>
          </div>
        </div>

      </div>
    </footer>
  );
}