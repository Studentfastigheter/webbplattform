"use client";

import React from "react";
import { ArrowDown } from "lucide-react";
import { SectionBadge } from "@/components/ui/section-badge";

export const TrustHero = () => {
  return (
    <section className="relative bg-background border-b border-border overflow-hidden">
      
      {/* --- Bakgrundseffekter (Subtil premium-känsla) --- */}
      <div className="absolute inset-0"></div>
      <div className="absolute top-0 inset-x-0 h-px"></div>

      <div className="relative container mx-auto px-6 max-w-5xl pt-24 pb-20 lg:pt-32 lg:pb-24 text-center">
        <div className="flex justify-center">
          <SectionBadge text="Partnerskap" />
        </div>
        
        {/* --- Top Badge --- 
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Sveriges största studentnätverk
          </span>
        </div>
*/}
        {/* --- Huvudrubrik --- */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8 text-balance">
          Vi skapar förtroende mellan <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pop-contrast">
             studenter och bostadsmarknad.
          </span>
        </h1>

        {/* --- Ingress --- */}
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12">
          En plattform byggd för studenter, av studenter – i nära samarbete med landets ledande bostadsaktörer.
        </p>

        {/* --- Metrics / Stats (Trovärdighetsbyggare) --- 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12 border-y border-slate-100 py-8 mb-12 bg-white/50 backdrop-blur-sm">
           <div className="flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-2 text-emerald-700 mb-1">
                 <ShieldCheck size={20} />
                 <span className="font-bold text-sm uppercase tracking-wide">Trygghet</span>
              </div>
              <span className="text-3xl font-bold text-slate-900">20</span>
              <span className="text-sm text-slate-500">Betrodda partners</span>
           </div>
           
           <div className="flex flex-col items-center justify-center gap-1 md:border-l md:border-r border-slate-100">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                 <Users size={20} />
                 <span className="font-bold text-sm uppercase tracking-wide">Räckvidd</span>
              </div>
              <span className="text-3xl font-bold text-slate-900">45 000+</span>
              <span className="text-sm text-slate-500">Anslutna studenter</span>
           </div>

           <div className="flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-2 text-amber-700 mb-1">
                 <TrendingUp size={20} />
                 <span className="font-bold text-sm uppercase tracking-wide">Nätverk</span>
              </div>
              <span className="text-3xl font-bold text-slate-900">20+</span>
              <span className="text-sm text-slate-500">Partner-lärosäten</span>
           </div>
        </div>
*/}
        {/* --- Scroll Indicator --- */}
        <div className="animate-bounce text-muted-foreground/60 flex justify-center">
            <ArrowDown size={24} />
        </div>

      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

// Enkla ikoner för Marquee-delen (om du inte vill importera massor)
const Building2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
const SchoolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
