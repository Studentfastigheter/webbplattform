"use client";

import { HelpCircle } from "lucide-react";
import Reveal from "@/lib/reveal"; 

const faqs = [
  {
    q: "Är CampusLyan gratis för studenter?",
    a: "Ja, 100%. Att skapa konto, söka bostäder, bevaka köer och ta kontakt med uthyrare är helt kostnadsfritt för dig som student.",
  },
  {
    q: "Varför behöver jag logga in med BankID?",
    a: "Vi använder BankID för att verifiera att du är en riktig person. Det skapar en tryggare plattform för alla och gör att hyresvärdar prioriterar din ansökan.",
  },
  {
    q: "Hur fungerar bostadsköerna på sidan?",
    a: "Vi samlar information och lediga objekt från både kommunala och privata bolag. Vi guidar dig till var du har störst chans att få en bostad och hur du ställer dig i respektive kö.",
  },
  {
    q: "Kan jag hyra ut mitt rum om jag ska på utbyte?",
    a: "Absolut! Inom kort kan du enkelt lägga upp en annons för att hitta en annan verifierad student som vill hyra ditt rum under tiden du är borta.",
  },
  {
    q: "Hur fungerar matchningen för privatpersoner?",
    a: "Vi verifierar alla användare för att eliminera bedrägerier. Du får kontakt med seriösa studenter och vi guidar er genom processen så att uthyrningen blir trygg för båda parter.",
  },
  {
    q: "Varför ser jag inte adressen direkt?",
    a: "För att skydda både din och uthyrarens integritet visas exakt adress och kontaktuppgifter först när du är inloggad.",
  },
  {
    q: "Kan jag se restid till mitt campus?",
    a: "Ja! I kartvyn kan du filtrera bostäder baserat på hur lång tid det tar att ta sig till just din skola med cykel eller kollektivtrafik.",
  },
  {
    q: "Hjälper ni till med mer än bara boende?",
    a: "Vi vill göra hela din bostadsresa enklare. Därför samlar vi även spartips, guider för studentekonomi och checklistor inför din första flytt.",
  },
];

export default function Faq() {
  return (
    <section className="relative py-16 lg:py-24 overflow-hidden" id="faq">
      
      {/* Bakgrundsdekoration - Anpassad för att synas subtilt i båda lägen */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-brand-green-light/30 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        
        {/* Header Section */}
        <Reveal variant="up">
            <div className="flex flex-col items-center text-center mb-12 lg:mb-16 space-y-4">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green-light/20 backdrop-blur-sm border border-brand-green-light/30 text-primary text-[10px] sm:text-xs font-bold tracking-wide uppercase shadow-sm">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Hjälpcenter
            </div>
            
            {/* Rubrik - Använder 'text-current' för att ärva färg från förälder (som kan vara vit på grön bakgrund) */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-[1.1]">
                Vanliga frågor <span className="text-pop">& svar</span>
            </h2>
            <p className="max-w-2xl text-muted-foreground text-base sm:text-lg">
                Här hittar du svaren på de vanligaste funderingarna kring CampusLyan. 
                Hittar du inte det du söker? Kontakta vår support.
            </p>
            </div>
        </Reveal>

        {/* FAQ Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {faqs.map((f, i) => (
            <Reveal key={i} variant="up" delay={i * 50}>
                {/* ARTIKEL / KORT:
                   - Light Mode: bg-white (Helvit platta för kontrast mot grön bakgrund)
                   - Dark Mode: dark:bg-white/5 (Glassmorphism mot svart bakgrund)
                   - Hover: Lite lyft och glow effekt
                */}
                <article
                  className="h-full rounded-2xl border transition-all duration-300 group
                             bg-card border-border shadow-sm
                             hover:shadow-xl hover:-translate-y-1 hover:border-primary/30"
                >
                <div className="flex items-start gap-4 p-6 md:p-8">
                    
                    {/* Ikon-cirkel */}
                    <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-full items-center justify-center transition-all
                                    bg-brand-green-light/30 text-primary border border-brand-green-light/50
                                    group-hover:scale-110 group-hover:bg-brand-green-light">
                        <HelpCircle size={18} />
                    </div>

                    <div className="space-y-2">
                        {/* Fråga:
                           - Light: text-slate-900 (Mörk text på vitt kort)
                        */}
                        <h3 className="font-bold text-lg leading-tight transition-colors
                                       text-foreground 
                                       group-hover:text-primary">
                            {f.q}
                        </h3>
                        
                        {/* Svar:
                           - Light: text-slate-600
                        */}
                        <p className="text-sm sm:text-base leading-relaxed
                                      text-muted-foreground">
                            {f.a}
                        </p>
                    </div>
                </div>
                </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}