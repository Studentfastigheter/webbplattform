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
    title: "Kartvy som berättar en story",
    description: "Kombinera campus, kollektivtrafik och filter i samma vy så att studenter ser sitt nästa hem direkt.",
  },
  {
    area: "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
    icon: <Settings className="h-4 w-4 text-black dark:text-neutral-400" />,
    title: "Publicera annonser utan friktion",
    description: "Företag och privatvärdar laddar upp bilder, regler och kövillkor och går live på minuter.",
  },
  {
    area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]",
    icon: <Lock className="h-4 w-4 text-black dark:text-neutral-400" />,
    title: "Trygga samarbetspartners",
    description: "Verifiering, avtal och transparent kommunikation gör att både studenter och värdar vågar agera.",
  },
  {
    area: "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
    icon: <Sparkles className="h-4 w-4 text-black dark:text-neutral-400" />,
    title: "Berättande landningssida",
    description: "Scrollen guidar genom vårt utbud, hur köer fungerar och varför CampusLyan är självklara valet.",
  },
  {
    area: "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]",
    icon: <Search className="h-4 w-4 text-black dark:text-neutral-400" />,
    title: "All info även utloggat",
    description: "Studenter, företag och privatpersoner hittar guider, processer och kontaktvägar utan att logga in.",
  },
];

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="group relative h-full rounded-2xl border border-black/5 p-2 shadow-sm dark:border-white/10 md:rounded-3xl md:p-3">
        <GlowingEffect
          blur={0}
          borderWidth={3}
          spread={80}
          glow
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl bg-white p-6 dark:bg-neutral-900 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
          <div className="flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-gray-200 p-2 dark:border-neutral-700">{icon}</div>
            <div className="space-y-3">
              <h3 className="font-sans text-xl font-semibold leading-tight text-balance text-black md:text-2xl dark:text-white">
                {title}
              </h3>
              <p className="font-sans text-sm leading-relaxed text-black/70 md:text-base dark:text-neutral-400">{description}</p>
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
      <div className="container-page space-y-4 text-center">
        <p className="eyebrow text-brand dark:text-brand">Alla funktioner</p>
        <h2 className="h2 text-slate-900 dark:text-white">Glödande komponenter för en svensk studentupplevelse</h2>
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Layouten följer inspirationen från Nextly och aceternitys glowing-kort. All text är uppdaterad till svenska så att
          landningssidan är konsekvent.
        </p>
      </div>

      <ul className="container-page mt-10 grid grid-cols-1 grid-rows-none gap-4 text-slate-900 dark:text-white md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
        {gridItems.map((item) => (
          <GridItem key={item.title} {...item} />
        ))}
      </ul>
    </section>
  );
}
