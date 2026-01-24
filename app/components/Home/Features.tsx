"use client";

import { type ReactNode } from "react";
import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface GridItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

// Data array för grid-items
const gridItems: GridItemProps[] = [
  {
    className: "lg:col-span-2", // Feature card (brett)
    // Använder 'text-pop' för konsekvent highlight färg i light/dark
    icon: <Box className="h-6 w-6 text-primary" />,
    title: "Campusnära sökning med precision",
    description:
      "Hitta boenden baserat på restid till ditt campus, kollektivtrafik och studentområden. Filtrera på hyra, kötider och inflyttningsdatum för att hitta rätt direkt.",
  },
  {
    className: "lg:col-span-1",
    icon: <Settings className="h-6 w-6 text-primary" />,
    title: "En profil – alla möjligheter",
    description:
      "Skapa din studentprofil en gång. Använd den för att snabbt presentera dig för privatvärdar och visa seriositet.",
  },
  {
    className: "lg:col-span-1",
    icon: <Search className="h-6 w-6 text-primary" />,
    title: "Vi har gjort research-jobbet",
    description:
      "Slipp 20 flikar. Vi samlar köregler, inkomstkrav och spartips i ett flöde så du kan fokusera på tentorna.",
  },
  {
    className: "lg:col-span-1",
    icon: <Sparkles className="h-6 w-6 text-primary" />,
    title: "Maximera dina chanser",
    description:
      "Förstå köerna. Se var dina poäng räcker och få tips på hyresvärdar med kortast väntetid just nu.",
  },
  {
    className: "lg:col-span-1",
    icon: <Lock className="h-6 w-6 text-primary" />,
    title: "Slipp osäkra grupper",
    description:
      "Vi verifierar uthyrare och skapar en trygg mötesplats för studenter där du kan söka boende utan att bli lurad.",
  },
];

const GridItem = ({ icon, title, description, className }: GridItemProps) => {
  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* KORT CONTAINER:
         Light: bg-card (vit), border-border
      */}
      <div className="group relative h-full rounded-2xl border border-border bg-card p-2 shadow-sm transition-all hover:shadow-md md:rounded-3xl md:p-3">
        
        {/* Glowing Effect */}
        <GlowingEffect
          blur={0}
          borderWidth={3}
          spread={60}
          glow
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        
        {/* INRE CONTAINER:
           Light: bg-slate-50/50 (subtil grå)
        */}
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl bg-brand-beige-200 p-6 md:p-8">
          <div className="flex flex-col gap-4">
            
            {/* Ikon Container: 
                Light: bg-emerald-100, border-emerald-200
            */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green-light/30 border border-brand-green-light/50">
                {icon}
            </div>
            
            <div className="space-y-3">
              {/* Rubrik: text-foreground (Svart / Vit) */}
              <h3 className="text-xl font-bold leading-tight text-foreground md:text-2xl">
                {title}
              </h3>
              {/* Beskrivning: text-muted-foreground (Mörkgrå / Ljusgrå) */}
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Features() {
  return (
    // Sektion: bg-background (Vit / Mörkgrön-Svart)
    <section className="relative overflow-hidden py-16 lg:py-24 bg-background" id="funktioner">
      
      {/* Bakgrundsdekorationer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Blob: bg-emerald-50 i light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-brand-green-light/20 rounded-[100%] blur-3xl opacity-60"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-6 mb-12 md:mb-16">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green-light/20 border border-brand-green-light/30 text-primary text-[10px] sm:text-xs font-bold tracking-wide uppercase">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-pop"></span>
             </span>
             Plattformens funktioner
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground max-w-4xl leading-[1.1]">
            Allt som behövs för att studenter <br className="hidden md:block" /> och uthyrare ska <span className="text-pop">mötas tryggt</span>
          </h2>
          
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Upptäck funktionerna som hjälper studenter att hitta rätt boende – och gör det enkelt för företag och privatvärdar att publicera tryggt och effektivt.
          </p>
        </div>

        {/* Grid Layout - Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {gridItems.map((item, index) => (
            <GridItem key={index} {...item} />
          ))}
        </div>

      </div>
    </section>
  );
}