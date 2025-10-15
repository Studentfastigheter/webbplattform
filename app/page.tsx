'use client';

import Image from "next/image";
import SplitText from "./SplitText"; // Om SplitText ligger i samma app-mapp
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
    <div className="font-sans grid grid-rows-[1fr_auto] min-h-screen items-center justify-items-center bg-gray-50 text-gray-800 p-8 sm:p-20">
      <main className="flex flex-col gap-10 items-center text-center max-w-2xl">
        {/* LOGO */}
        <Image
          src="/campuslyan-logo.svg"
          alt="CampusLyan logo"
          width={180}
          height={180}
          className="rounded-xl"
          priority
        />

        {/* RUBRIK */}
        <SplitText
          text="Välkommen till CampusLyan"
          className="text-3xl sm:text-4xl font-bold tracking-tight text-[#004225]"
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
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <a
            href="mailto:info@campuslyan.se"
            className="px-6 py-3 rounded-full bg-[#004225] text-white hover:bg-green-800 transition"
          >
            Kontakta oss
          </a>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mt-12">
          Våra samarbetspartners
        </h2>
        {/* LOGOLOOP UNDER CTA */}
        <div className="w-full mt-10" style={{ height: '100px' }}>
          <LogoLoop
            logos={imageLogos}
            speed={60}
            direction="left"
            logoHeight={48}
            gap={40}
            pauseOnHover
            scaleOnHover
            fadeOut
            fadeOutColor="#ffffff"
            ariaLabel="Teknologier vi använder"
          />
        </div>

        {/* SOCIALA MEDIER */}
        <div className="flex gap-6 mt-8">
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
      <footer className="mt-16 text-sm text-gray-500">
        © {new Date().getFullYear()} CampusLyan AB – Alla rättigheter förbehållna.
      </footer>
    </div>
  );
}