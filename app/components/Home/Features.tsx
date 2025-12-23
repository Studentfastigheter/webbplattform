"use client";

import { type ReactNode } from "react";
import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface GridItemProps {
  area: string;
  icon: ReactNode;
  title: string;
  description: string;
}

const gridItems: GridItemProps[] = [
  {
    area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]",
    icon: <Box className="h-4 w-4 text-black dark:text-neutral-400" />,
    title: "Campusnära sökning med precision",
    description:
      "Hitta boenden baserat på restid till ditt campus, kollektivtrafik och studentområden. Filtrera på hyra, kötider och inflyttningsdatum för att hitta rätt direkt.",
  },
{
    area: "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
    icon: <Settings className="h-4 w-4 text-black dark:text-neutral-400" />,
    title: "En profil – alla möjligheter",
    description:
      "Skapa din studentprofil en gång. Snart kan du använda den för att snabbt presentera dig för privatvärdar och visa att du är en seriös hyresgäst.",
  },
  {
    area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]",
    icon: <Search className="h-4 w-4 text-black dark:text-neutral-400" />,
    title: "Vi har gjort research-jobbet",
    description:
      "Slipp ha 20 flikar öppna. Vi samlar köregler, inkomstkrav och spartips för studentlivet i ett flöde, så att du kan fokusera på tentorna istället.",
  },
{
    area: "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
    icon: <Sparkles className="h-4 w-4 text-black dark:text-neutral-400" />,
    title: "Maximera dina chanser",
    description:
      "Vi hjälper dig att förstå de krångliga köerna. Se var dina köpoäng faktiskt räcker till och få tips på hyresvärdar med kortast väntetid just nu.",
  },
{
    area: "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]",
    icon: <Lock className="h-4 w-4 text-black dark:text-neutral-400" />,
    title: "Slipp osäkra Facebook-grupper",
    description:
      "Trött på fejkprofiler och ockerhyror? Vi verifierar uthyrare och skapar en trygg mötesplats för studenter där du kan söka boende utan att bli lurad.",
  },
];


const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={`list-none w-full ${area}`}>
      <div className="group relative h-full rounded-2xl border border-black/5 p-2 shadow-sm dark:border-white/10 md:rounded-3xl md:p-3">
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
        <div className="relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-xl bg-white p-5 dark:bg-neutral-900 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
          <div className="flex flex-1 flex-col gap-3">
            <div className="w-fit rounded-lg border border-gray-200 p-2 dark:border-neutral-700">{icon}</div>
            <div className="space-y-2">
              <h3 className="font-sans text-lg font-semibold leading-tight text-balance text-black md:text-xl dark:text-white">
                {title}
              </h3>
              {/* <-- TOG BORT line-clamp-3 */}
              <p className="font-sans text-sm leading-relaxed text-black/70 md:text-[15px] dark:text-neutral-400">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default function Features() {
  return (
    <section className="section bg-neutral-50 text-slate-900 dark:bg-black dark:text-white" id="funktioner">
      <div className="container-page space-y-3 text-center">
        <p className="eyebrow text-brand dark:text-brand">Plattformens funktioner</p>
        <h2 className="h2 text-slate-900 dark:text-white">Allt som behövs för att studenter och uthyrare ska mötas tryggt</h2>
        <p className="mx-auto max-w-3xl text-[15px] text-slate-600 dark:text-slate-300">
          Upptäck funktionerna som hjälper studenter att hitta rätt boende – och gör det enkelt för företag och privatvärdar att publicera tryggt och effektivt.
        </p>
      </div>

      {/* Låt griden auto-anpassa höjd – inga auto-rows som låser korten */}
      <ul className="container-page mt-8 grid grid-cols-1 gap-4 text-slate-900 dark:text-white md:grid md:grid-cols-12 md:gap-3 md:grid-flow-dense lg:gap-4 xl:grid-rows-2">
        {gridItems.map((item) => (
          <GridItem key={item.title} {...item} />
        ))}
      </ul>
    </section>
  );
}
