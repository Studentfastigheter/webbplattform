"use client";

import Image from "next/image";
import type { ComponentType } from "react";
import { Typography, type TypographyProps } from "@material-tailwind/react";
import { FaLinkedin, FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa6";
import { SiThreads } from "react-icons/si";
import { HiGlobeAlt } from "react-icons/hi";

const Text = Typography as unknown as ComponentType<Partial<TypographyProps>>;

const PLATTFORM_LINKS = [
  { href: "/for-foretag", label: "För Företag" },
];

const PARTNER_LINKS = [
  { href: "/partners", label: "Samarbetspartners" },
];

const COMPANY_LINKS = [
  { href: "/om", label: "Om Oss" },
  { href: "/faq", label: "FAQ" },
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
    // BAKGRUND:
    // Här använder vi en specifik färgkod (#004225) istället för variabler.
    // Detta gör att footern ALLTID är mörkgrön, oavsett Dark/Light mode på resten av sidan.
    <footer className="relative w-full mt-24 bg-[#004225] text-brand-beige-200">
      
      {/* --- DECORATION --- */}
      {/* Ligger precis ovanför footern. SVG:n bör ha samma färg (#004225) för att smälta ihop. */}
      <div className="absolute top-0 left-0 right-0 w-full -translate-y-[99%] overflow-hidden leading-[0] z-10 pointer-events-none">
        <div className="relative w-full h-[60px] sm:h-[100px] lg:h-[160px]">
          <Image
            src="/footer-decoration.svg" 
            alt="Decoration"
            fill
            className="object-cover w-full h-full"
            priority
          />
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="mx-auto w-full max-w-[1400px] px-6 pb-16 pt-8 sm:px-10 lg:px-16 relative z-20">
        
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          
          {/* VÄNSTER KOLUMN */}
          <div className="flex flex-col gap-8 lg:col-span-5">
            <div className="flex flex-row items-center gap-5">
              
              {/* Logo */}
              <div className="relative h-14 w-14 shrink-0">
                <Image
                  src="/campuslyan-logo.svg"
                  alt="CampusLyan"
                  fill 
                  // Alltid vit logga
                  className="object-contain brightness-0 invert"
                />
              </div>

              {/* Beskrivning */}
              {/* Alltid vit/transparent border */}
              <div className="border-l-2 pl-5 py-1 border-white/20">
                <Text className="max-w-md text-sm font-light leading-relaxed">
                  Vi gör det enkelt att hitta, jämföra och hyra studentbostäder runt om i landet.
                </Text>
              </div>
            </div>

            {/* Sociala Ikoner */}
            <div className="flex gap-4 text-lg">
              {SOCIAL_LINKS.map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  // Alltid vita ikoner
                  className="transition-colors hover:opacity-80 "
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* HÖGER KOLUMN (Länkar) */}
          <div className="flex flex-col gap-10 lg:col-span-7 lg:pl-10 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              
              {[
                { title: "Plattform", links: PLATTFORM_LINKS },
                { title: "Partners", links: PARTNER_LINKS },
                { title: "CampusLyan", links: COMPANY_LINKS }
              ].map((section, idx) => (
                <div key={idx}>
                  <div className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest ">
                    <span className="h-4 w-[2px] bg-white/40"></span>
                    {section.title}
                  </div>
                  
                  <ul className="flex flex-col gap-3 group">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <a 
                          href={link.href} 
                          // Alltid ljus text (white/80) som blir helt vit vid hover
                          className="text-xs font-bold uppercase tracking-wide transition-all hover:underline hover:underline-offset-4"
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
        {/* Alltid ljus border och text */}
        <div className="mt-20 flex flex-col items-start justify-between border-t pt-6 text-xs font-medium sm:flex-row sm:items-center border-white/10">
          <div>
            Copyright © {year} CampusLyan. Alla rättigheter förbehållna.
          </div>
          
          <div className="mt-4 flex items-center gap-2 cursor-pointer transition-colors sm:mt-0">
            <HiGlobeAlt className="text-lg" />
            <span className="uppercase tracking-wide">Svenska</span>
            <span className="text-[10px]">▼</span>
          </div>
        </div>

      </div>
    </footer>
  );
}