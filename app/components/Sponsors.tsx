"use client";
import LogoLoop from "./LogoLoop/LogoLoop";

const logos = [
  { src: "/logos/campuslyan-logo.svg", alt: "CampusLyan", href: "https://campuslyan.se" },
  { src: "/logos/sgs-logo.svg", alt: "SGS", href: "https://sgs.se" },
  // lägg till fler här
];

export default function Sponsors() {
  return (
    <section className="mt-16 text-center">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">Sponsorer & partners</h2>
      <div className="mx-auto max-w-5xl" style={{ height: 72 }}>
        <LogoLoop
          logos={logos}
          speed={50}
          direction="left"
          logoHeight={48}
          gap={32}
          pauseOnHover
          scaleOnHover
          fadeOut
          fadeOutColor="#ffffff"
          ariaLabel="Sponsorer och partners"
        />
      </div>
    </section>
  );
}