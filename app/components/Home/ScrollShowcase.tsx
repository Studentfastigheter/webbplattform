"use client";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { FlipWords } from "@/components/ui/flip-words";
import Image from "next/image";
import { Button } from "@heroui/button";
import { ArrowRight } from "lucide-react";

export default function ScrollShowcase() {
  return (
    <div className="bg-secondary/30 dark:bg-background">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center justify-center space-y-8 mb-12 lg:mb-24">
            
            {/* Avy-style Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-border shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pop opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pop"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-foreground">
                Snart lanseras CampusLyan
              </span>
            </div>

            {/* Rubrik */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-foreground leading-[1.05] text-center max-w-5xl mx-auto tracking-tight">
              Lyor för studenter i <br className="hidden md:block" />
              <span className="inline-block mt-2 md:mt-0">
                <FlipWords
                  words={["Göteborg", "Stockholm", "Lund", "Uppsala", "Linköping"]}
                  duration={2500}
                  className="text-primary dark:text-pop" 
                />
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-center leading-relaxed">
              Vi samlar bostadsköer, studentbostäder och privata uthyrare på ett ställe. 
              Sök smartare, inte hårdare.
            </p>
          </div>
        }
      >
        {/* --- HUVUDKORTET --- */}
        <div className="flex h-full flex-col gap-6 rounded-[2rem] bg-card border border-border p-6 md:p-8 shadow-2xl shadow-black/10 dark:shadow-black/40">
          
          {/* Header i kortet */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-secondary text-xs font-bold text-secondary-foreground uppercase tracking-wider">
                  Aggregerade annonser
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Hitta ditt nästa hem
              </h2>
            </div>
            {/* Dekorativa punkter */}
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
            </div>
          </div>

          {/* --- INNEHÅLL (Grid) --- */}
          <div className="grid gap-6 lg:grid-cols-12 h-full">
            
            {/* Vänster: Stor bild (7 cols) */}
            <div className="relative lg:col-span-7 overflow-hidden rounded-3xl border border-border bg-muted group">
              <Image
                src="/appartment.jpg" 
                alt="Showcase appartment"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
               {/* Overlay gradient */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
               <div className="absolute bottom-6 left-6 text-white">
                 <p className="font-bold text-lg">Studentbostäder i fokus</p>
                 <p className="text-sm opacity-90">Vi verifierar alla hyresvärdar</p>
               </div>
            </div>

            {/* Höger: Detaljkort (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Objektkort */}
              <div className="flex flex-col justify-between h-full rounded-3xl bg-secondary/30 dark:bg-white/5 border border-border p-6 hover:border-primary/30 transition-colors">
                
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Objekt</p>
                            <h3 className="text-2xl font-bold text-foreground">1:a Vasastan</h3>
                        </div>
                        <div className="text-right">
                             <p className="text-xl font-bold text-primary dark:text-pop">4 200 kr</p>
                             <p className="text-xs text-muted-foreground">/ månad</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-white dark:bg-black/20 rounded-lg text-sm font-medium border border-border">25 m²</span>
                        <span className="px-3 py-1 bg-white dark:bg-black/20 rounded-lg text-sm font-medium border border-border">Våning 3</span>
                        <span className="px-3 py-1 bg-white dark:bg-black/20 rounded-lg text-sm font-medium border border-border">Balkong</span>
                    </div>

                    <div className="space-y-2 pt-2">
                         <div className="flex items-center gap-3 text-sm text-foreground/80">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">📍</div>
                            8 min cykel till Chalmers
                         </div>
                         <div className="flex items-center gap-3 text-sm text-foreground/80">
                            <div className="w-8 h-8 rounded-full bg-pop/10 flex items-center justify-center text-pop">⚡</div>
                            Bredband & El ingår
                         </div>
                    </div>
                </div>

                <Button 
                  className="mt-6 w-full py-6 font-bold text-md shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
                  radius="full"
                  endContent={<ArrowRight size={18} />}
                >
                  Ansök direkt
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}