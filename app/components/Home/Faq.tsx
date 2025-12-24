"use client";

import Link from "next/link";
import { Button } from "@heroui/button";
import { HelpCircle, ArrowRight } from "lucide-react";
import Reveal from "@/lib/reveal"; // Om du använder Reveal-komponenten från tidigare

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
    <section className="relative py-16 lg:py-24 bg-white overflow-hidden" id="faq">
      
      {/* Bakgrundsdekoration */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-emerald-50/50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        
        {/* Header Section */}
        <Reveal variant="up">
            <div className="flex flex-col items-center text-center mb-12 lg:mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-bold tracking-wide uppercase shadow-sm">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Hjälpcenter
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.1]">
                Vanliga frågor <span className="text-emerald-600">& svar</span>
            </h2>
            <p className="max-w-2xl text-slate-600 text-base sm:text-lg">
                Här hittar du svaren på de vanligaste funderingarna kring CampusLyan. 
                Hittar du inte det du söker? Kontakta vår support.
            </p>
            </div>
        </Reveal>

        {/* FAQ Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {faqs.map((f, i) => (
            <Reveal key={i} variant="up" delay={i * 50}>
                <article
                className="h-full rounded-2xl border border-slate-200 bg-slate-50/50 p-6 md:p-8 transition-all duration-300 hover:bg-white hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 group"
                >
                <div className="flex items-start gap-4">
                    <div className="hidden sm:flex shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 items-center justify-center text-emerald-600 group-hover:border-emerald-200 group-hover:scale-110 transition-all">
                        <HelpCircle size={16} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
                            {f.q}
                        </h3>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
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