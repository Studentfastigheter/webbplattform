'use client';

import React from 'react';
// Importera samma ikoner som i footern
import { FaLinkedin, FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa6";
import { SiThreads } from "react-icons/si";

interface HeroSectionProps {
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  showSocials?: boolean;
}

// Samma länkar som i din Footer
const SOCIAL_LINKS = [
  { href: "https://www.linkedin.com/company/campuslyan", icon: <FaLinkedin size={22} />, label: "LinkedIn" },
  { href: "https://www.instagram.com/campuslyanse", icon: <FaInstagram size={22} />, label: "Instagram" },
  { href: "https://www.facebook.com/campuslyan", icon: <FaFacebook size={22} />, label: "Facebook" },
  { href: "https://www.tiktok.com/@campuslyan", icon: <FaTiktok size={22} />, label: "TikTok" },
  { href: "https://www.threads.net/@campuslyan", icon: <SiThreads size={22} />, label: "Threads" },
];

export default function HeroSection({
  title = "Kontakt",
  description = "Vill du veta mer om vår produkt och hur den skulle passa din organisation? Söker du jobb eller vill du bara prata med någon av oss? Då har du hittat rätt.",
  imageSrc = "https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/675aaa8c603a57685723e3a6_contact%20us%20bg.png",
  imageAlt = "Mobiltelefon som ringer till Avy",
  showSocials = true
}: HeroSectionProps) {
  return (
    <section className="bg-background pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Vänster kolumn: Text */}
          <div className="flex flex-col justify-center">
            
            {/* Rubrik-container med den gröna linjen */}
            <div className="pl-8 md:pl-11 border-l-[3px] border-pop mb-10">
              <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight">
                {title}
              </h1>
            </div>
            
            {/* Beskrivning och Socials */}
            <div className="max-w-lg">
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                {description}
              </p>
              
              {showSocials && (
                <div className="flex flex-wrap gap-4">
                  {SOCIAL_LINKS.map((social, i) => (
                    <a 
                      key={i}
                      href={social.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group w-12 h-12 rounded-lg bg-brand-beige-100 flex items-center justify-center text-foreground transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-lg hover:-translate-y-1"
                      aria-label={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Höger kolumn: Bild */}
          <div className="relative w-full">
            {/* Bildcontainer med rundade hörn */}
            <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
              <img 
                src={imageSrc} 
                alt={imageAlt} 
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                loading="eager"
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}