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
  title: "Kartvy som guidar din bostadsresa",
  description:
    "Se bostäder i relation till campus, restider, kollektivtrafik och studentaktiviteter. Filtrera på pris, köer och inflytt – och hitta rätt område direkt.",
},
{
  area: "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
  icon: <Settings className="h-4 w-4 text-black dark:text-neutral-400" />,
  title: "Publicera bostäder – för företag och privatvärdar",
  description:
    "Lägg upp annonser på minuter. Via portal eller API fyller du enkelt i regler, villkor och bilder. Smarta förslag hjälper dig till en komplett och trygg publicering.",
},
{
  area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]",
  icon: <Search className="h-4 w-4 text-black dark:text-neutral-400" />,
  title: "All information du behöver – samlad i ett flöde",
  description:
    "Köregler, krav, avtal, guider, spartips och ekonomiöversikter. Vi samlar allt så både studenter och uthyrare snabbt får koll utan att leta själva.",
},
{
  area: "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
  icon: <Sparkles className="h-4 w-4 text-black dark:text-neutral-400" />,
  title: "Guidade flöden som gör köer enkla",
  description:
    "Vi förklarar hur studentbostadsköer fungerar, vilka krav som gäller och hur du maxar dina chanser. Perfekt för nya studenter som snabbt vill förstå processen.",
},
{
  area: "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]",
  icon: <Lock className="h-4 w-4 text-black dark:text-neutral-400" />,
  title: "Trygghet i varje uthyrning",
  description:
    "Verifierade profiler, digitala avtal och en transparent chatthistorik. Vi tar bort riskerna – inga fler otrygga Facebook-grupper eller osäkra uthyrningar.",
},

];


const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={`list-none ${area}`}>  {/* <-- tog bort min-h */}
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
      <ul
        className="
          container-page mt-8
          grid grid-cols-1 gap-3 text-slate-900 dark:text-white
          md:grid-cols-12 md:gap-3
          lg:gap-4
          xl:grid-rows-2    /* ok att ha 2 rader; de växer efter innehåll */
          grid-flow-dense
        "
      >
        {gridItems.map((item) => (
          <GridItem key={item.title} {...item} />
        ))}
      </ul>
    </section>
  );
}
