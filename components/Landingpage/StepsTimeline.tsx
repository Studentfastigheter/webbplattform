"use client";

import Reveal from "@/lib/reveal";
import { UserPlus, Search, KeyRound } from "lucide-react"; // Lade till ikoner för extra touch

const steps = [
  {
    icon: UserPlus,
    title: "Skapa din studentprofil",
    desc: "Kom igång på några sekunder. Välj din studieort så anpassar vi flödet med relevanta bostadsbolag och områden som matchar just din skola.",
  },
  {
    icon: Search,
    title: "Hitta rätt köer & lyor",
    desc: "Utforska bostäder nära campus och se var dina köpoäng faktiskt räcker till. Vi samlar alla hyresvärdar på ett ställe så att du slipper leta manuellt.",
  },
  {
    icon: KeyRound,
    title: "Sök och ta kontakt",
    desc: "Vi guidar dig direkt till rätt ansökan hos bostadsbolagen eller låter dig ta en trygg första kontakt med verifierade privatvärdar. Resten är bara inflytt!",
  },
];

export default function StepsTimeline() {
  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      
      {/* Bakgrundsdekoration */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        
        {/* Header */}
        <Reveal variant="up">
          <div className="flex flex-col items-center text-center space-y-4 mb-12 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-emerald-700 text-[10px] sm:text-xs font-bold tracking-wide uppercase shadow-sm">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               Så funkar det
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.1]">
              Från registrering till <span className="text-emerald-600">inflytt</span> på tre steg
            </h2>
          </div>
        </Reveal>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 border-t-2 border-dashed border-slate-200 -z-10"></div>

          {steps.map((step, idx) => (
            <Reveal key={step.title} variant="up" delay={idx * 150}>
              <div className="relative flex flex-col items-center text-center group">
                
                {/* Number & Icon Circle */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center relative z-10 group-hover:scale-105 group-hover:border-emerald-100 transition-all duration-300">
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">
                      {idx + 1}
                    </div>
                    <step.icon size={32} className="text-emerald-600 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3 px-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {step.desc}
                  </p>
                </div>

              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}