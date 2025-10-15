'use client';

import Image from "next/image";
import SplitText from "./SplitText";
import LogoLoop from './components/LogoLoop/LogoLoop';
import './components/LogoLoop/LogoLoop.css';

export default function Home() {
  const imageLogos = [
    { src: "/logos/campuslyan-logo.svg", alt: "Logo 1", href: "https://example1.com" },
    { src: "/logos/campuslyan-logo.svg", alt: "Logo 2", href: "https://example2.com" },
    { src: "/logos/campuslyan-logo.svg", alt: "Logo 3", href: "https://example3.com" },
    { src: "/logos/campuslyan-logo.svg", alt: "Logo 4", href: "https://example4.com" },
  ];

  return (
    <div className="font-sans min-h-screen flex flex-col items-center bg-gray-50 text-gray-800 px-6 sm:px-20 py-10">
      <main className="flex flex-col gap-8 sm:gap-12 items-center text-center max-w-xl sm:max-w-2xl">
        {/* LOGO */}
        <Image
          src="/campuslyan-logo.svg"
          alt="CampusLyan logo"
          width={140}
          height={140}
          className="rounded-xl sm:w-36 sm:h-36"
          priority
        />

        {/* RUBRIK */}
        <SplitText
          text="Välkommen till CampusLyan"
          className="text-2xl sm:text-4xl font-bold tracking-tight text-[#004225]"
          delay={50}
          duration={0.2}
          ease="power3.out"
          splitType="chars"
        />

        <SplitText
          text="En ny plattform för studenter att hitta sitt nästa boende – skapad av studenter, för studenter.  
          Här kan du snart hitta lediga studentlägenheter, hyra ut rum och upptäcka samarbeten med stora studentbostadsbolag."
          className="text-gray-600 leading-relaxed text-base sm:text-lg"
          delay={10}
          duration={0.01}
          ease="power3.out"
          splitType="chars"
        />

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto justify-center">
          <a
            href="mailto:info@campuslyan.se"
            className="px-6 py-3 rounded-full bg-[#004225] text-white hover:bg-green-800 transition text-center w-full sm:w-auto"
          >
            Kontakta oss
          </a>
        </div>

        {/* PARTNERS RUBRIK */}
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mt-8">
          Våra samarbetspartners
        </h2>

        {/* LOGOLOOP */}
        <div className="w-full mt-4" style={{ height: '80px' }}>
          <LogoLoop
            logos={imageLogos}
            speed={40}           // lägre = långsammare
            direction="left"
            logoHeight={40}
            gap={24}
            pauseOnHover
            scaleOnHover
            fadeOut
            fadeOutColor="#ffffff"
            ariaLabel="Samarbetspartners"
          />
        </div>

        {/* SOCIALA MEDIER */}
        <div className="flex gap-6 mt-6">
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
      <footer className="mt-12 sm:mt-16 text-sm text-gray-500 text-center">
        © {new Date().getFullYear()} CampusLyan AB – Alla rättigheter förbehållna.
      </footer>
    </div>
  );
}