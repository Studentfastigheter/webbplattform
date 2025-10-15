'use client';

import Image from "next/image";
import SplitText from "./SplitText";
import LogoLoop from './components/LogoLoop/LogoLoop';
import './components/LogoLoop/LogoLoop.css';
import { useState, useEffect } from 'react';

export default function Home() {
  const imageLogos = [
    { src: "/logos/campuslyan-logo.svg", alt: "Logo 1", href: "https://example1.com" },
    { src: "/logos/campuslyan-logo.svg", alt: "Logo 2", href: "https://example2.com" },
    { src: "/logos/campuslyan-logo.svg", alt: "Logo 3", href: "https://example3.com" },
    { src: "/logos/campuslyan-logo.svg", alt: "Logo 4", href: "https://example4.com" },
  ];

  // Dynamisk höjd och hastighet för LogoLoop beroende på skärmstorlek
  const [logoHeight, setLogoHeight] = useState(48);
  const [speed, setSpeed] = useState(60);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) { // smala skärmar
        setLogoHeight(32);
        setSpeed(30);
      } else if (window.innerWidth < 1024) { // medium skärmar
        setLogoHeight(40);
        setSpeed(45);
      } else { // desktop
        setLogoHeight(48);
        setSpeed(60);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="font-sans flex flex-col min-h-screen bg-gray-50 text-gray-800 p-6 sm:p-12 lg:p-20">
      <main className="flex flex-col items-center w-full max-w-3xl mx-auto gap-8 sm:gap-10 text-center">
        
        {/* LOGO */}
        <Image
          src="/campuslyan-logo.svg"
          alt="CampusLyan logo"
          width={180}
          height={180}
          className="rounded-xl w-36 sm:w-44"
          priority
        />

        {/* RUBRIK */}
        <SplitText
          text="Välkommen till CampusLyan"
          className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#004225]"
          delay={50}
          duration={0.2}
          ease="power3.out"
          splitType="chars"
        />

        {/* BESKRIVNING */}
        <SplitText
          text={`En ny plattform för studenter att hitta sitt nästa boende – skapad av studenter, för studenter.
Här kan du snart hitta lediga studentlägenheter, hyra ut rum och upptäcka samarbeten med stora studentbostadsbolag.`}
          className="text-gray-600 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line"
          delay={10}
          duration={0.01}
          ease="power3.out"
          splitType="chars"
        />

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <a
            href="mailto:info@campuslyan.se"
            className="px-6 py-3 rounded-full bg-[#004225] text-white hover:bg-green-800 transition text-sm sm:text-base"
          >
            Kontakta oss
          </a>
        </div>

        {/* PARTNERS / LOGOLOOP */}
        <div className="w-full mt-10 flex flex-col items-center">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 mb-4">
            Våra samarbetspartners
          </h3>
          <div className="w-full" style={{ height: `${logoHeight + 20}px` }}>
            <LogoLoop
              logos={imageLogos}
              speed={speed}
              direction="left"
              logoHeight={logoHeight}
              gap={24}
              pauseOnHover
              scaleOnHover
              fadeOut
              fadeOutColor="#ffffff"
              ariaLabel="Samarbetspartners"
            />
          </div>
        </div>

        {/* SOCIALA MEDIER */}
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          <a href="https://www.linkedin.com/company/campuslyan/" target="_blank" rel="noopener noreferrer">
            <Image src="/icon-linkedin.svg" alt="LinkedIn" width={28} height={28} />
          </a>
          <a href="https://www.facebook.com/profile.php?id=61582374446085" target="_blank" rel="noopener noreferrer">
            <Image src="/icon-facebook.svg" alt="Facebook" width={28} height={28} />
          </a>
          <a href="https://www.instagram.com/campuslyanse/" target="_blank" rel="noopener noreferrer">
            <Image src="/icon-instagram.svg" alt="Instagram" width={28} height={28} />
          </a>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="mt-16 text-sm sm:text-base text-gray-500 text-center">
        © {new Date().getFullYear()} CampusLyan AB – Alla rättigheter förbehållna.
      </footer>
    </div>
  );
}