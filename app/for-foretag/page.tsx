"use client";

import React from "react";
import { 
  BarChart3, 
  Database,
  Users,
  ShieldCheck,
  Check,
  Search,
  ArrowRight,
  Server,
  AppWindow,
  Quote,
  TrendingUp,
  Home 
} from "lucide-react";

// --- Recharts / Shadcn Imports ---
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { Hero } from "@/components/for-foretag-sections/Hero";
import Script from "next/script";

// OBS: Om du har FeatureRow i en separat fil, uppdatera den enligt komponenten längst ner i denna fil.
// Jag har definierat den här lokalt för att visa hur flex-logiken fungerar.
// import { FeatureRow } from "@/components/for-foretag-sections/FeatureRow"; 

// --- Static Data for Chart (Behåller dessa om du ska använda dem senare) ---
const chartData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 320 },
  { month: "Apr", desktop: 333, mobile: 390 },
  { month: "May", desktop: 409, mobile: 430 },
  { month: "Jun", desktop: 514, mobile: 540 },
];

const chartConfig = {
  desktop: {
    label: "Ansökningar",
    color: "#3b82f6", 
  },
  mobile: {
    label: "Visningar",
    color: "#10b981", 
  },
} satisfies ChartConfig;

// --- FEATURE ROW KOMPONENT (LÄGG DENNA I DIN KOMPONENT-FIL ELLER LÄNGST NER) ---
// Detta är nyckeln till mobilanpassningen:
// 1. "flex-col" lägger saker på hög (mobil).
// 2. Texten ligger först i DOM:en, så den hamnar överst.
// 3. "lg:flex-row" eller "lg:flex-row-reverse" styr desktop-ordningen.
const FeatureRow = ({ 
  flipped = false, 
  tag, 
  title, 
  description, 
  children 
}: { 
  flipped?: boolean; 
  tag: string; 
  title: string; 
  description: string; 
  children: React.ReactNode; 
}) => {
  return (
    <div className={`flex flex-col gap-8 lg:gap-16 items-center ${flipped ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
      {/* Text Section - Ligger alltid först i koden för att hamna överst på mobil */}
      <div className="flex-1 space-y-4 text-left">
        <div className="inline-block px-3 py-1 rounded-full bg-emerald-100/50 text-emerald-700 font-bold uppercase tracking-wider text-xs mb-2">
          {tag}
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
          {title}
        </h2>
        <p className="text-slate-600 text-lg leading-relaxed">
          {description}
        </p>
      </div>

      {/* Visual Section */}
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
};

export default function Page() {

  return (
    <div className="bg-white min-h-screen selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      
      <Hero 
        title={<span>Marknadsför till – <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-600">Sveriges studenter</span></span>}
        description="Anslut ditt fastighetssystem och nå hela marknaden automatiskt. Vi verifierar studenterna enligt din kravprofil, så att du kan fylla vakanserna helt utan administration."
        primaryCtaText="Kom igång"
        primaryCtaLink="#bokning"
      />

      {/* Ändrat py-32 till py-16 lg:py-32 för bättre mobilupplevelse */}
      <section className="relative z-10 py-16 lg:py-32 px-6 max-w-7xl mx-auto space-y-24 lg:space-y-32">
        
        {/* Feature 1: Räckvidd */}
        <FeatureRow 
          flipped={true} 
          tag="Räckvidd"
          title="Den optimala marknadskanalen"
          description="Med CampusLyan når ni ut till alla studenter i Sverige på ett och samma ställe. Vi samlar studenterna i en gemensam plattform, vilket ger er maximal exponering mot rätt målgrupp utan onödigt spill."
        >
            {/* Ändrat height till responsiv: h-[350px] på mobil, h-[480px] på desktop */}
            <div className="relative h-[350px] lg:h-[480px] bg-slate-50 rounded-[2.5rem] p-4 lg:p-8 flex flex-col items-center justify-center overflow-hidden border border-slate-100 shadow-lg">
                
                {/* Abstrakt sökbar */}
                <div className="w-52 lg:w-64 h-10 lg:h-12 bg-white rounded-full shadow-sm border border-slate-200 flex items-center px-4 mb-6 lg:mb-8 z-20">
                    <Search className="text-emerald-500 w-4 h-4 lg:w-5 lg:h-5 mr-3" />
                    <div className="h-2 w-24 bg-slate-100 rounded-full"></div>
                </div>

                {/* Matchningskort */}
                <div className="relative z-10 w-64 lg:w-72 space-y-3">
                    {/* Kort 1 */}
                    <div className="bg-white p-3 lg:p-4 rounded-xl shadow-md border border-slate-100 flex items-center gap-4 animate-[slideUp_4s_infinite]">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <Users size={18} className="text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <div className="h-2 w-20 bg-slate-800 rounded-full mb-2"></div>
                            <div className="h-1.5 w-12 bg-slate-300 rounded-full"></div>
                        </div>
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Check size={14} className="text-emerald-600" />
                        </div>
                    </div>

                    {/* Kort 2 */}
                    <div className="bg-white p-3 lg:p-4 rounded-xl shadow-md border border-slate-100 flex items-center gap-4 opacity-70 scale-95 animate-[slideUp_4s_infinite_1s]">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <Users size={18} className="text-slate-400" />
                        </div>
                        <div className="flex-1">
                             <div className="h-2 w-16 bg-slate-800 rounded-full mb-2"></div>
                             <div className="h-1.5 w-10 bg-slate-300 rounded-full"></div>
                        </div>
                    </div>

                    {/* Kort 3 */}
                    <div className="bg-white p-3 lg:p-4 rounded-xl shadow-md border border-slate-100 flex items-center gap-4 opacity-40 scale-90 animate-[slideUp_4s_infinite_2s]">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-100 rounded-full flex items-center justify-center">
                             <Users size={18} className="text-slate-400" />
                        </div>
                        <div className="flex-1">
                             <div className="h-2 w-24 bg-slate-800 rounded-full mb-2"></div>
                             <div className="h-1.5 w-14 bg-slate-300 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Bakgrundsdekoration */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-50/50 via-transparent to-transparent"></div>
            </div>
        </FeatureRow>

        {/* Feature 2: Verifiering */}
        <FeatureRow 
          flipped={false}
          tag="Kvalitetssäkring"
          title="Verifierade studenter – inga spökanvändare"
          description="Vi säkerställer att alla registrerade användare är aktiva studenter genom strikt verifiering. Detta eliminerar spökanvändare i era bostadsköer och garanterar att ni enbart hanterar ansökningar från behöriga sökande."
        >
              <div className="relative h-[350px] lg:h-[480px] bg-[#0f172a] rounded-[2.5rem] p-4 lg:p-8 flex items-center justify-center overflow-hidden shadow-2xl shadow-slate-900/40 group border border-slate-800">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                  
                  <div className="relative w-full max-w-sm">
                    <div className="relative bg-[#1e293b] rounded-2xl p-1 border border-slate-700 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-emerald-500/30">
                       <div className="bg-[#0f172a] rounded-xl p-4 lg:p-6 relative overflow-hidden">
                           <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] z-20 animate-[scan_3s_ease-in-out_infinite]"></div>

                           <div className="flex justify-between items-start mb-6 lg:mb-8">
                               <div className="w-12 h-12 lg:w-16 lg:h-16 bg-slate-700/50 rounded-full flex items-center justify-center border border-slate-600">
                                 <Users className="text-slate-400" size={24} />
                               </div>
                               <ShieldCheck className="text-emerald-500 w-6 h-6 lg:w-8 lg:h-8" />
                           </div>
                           
                           <div className="space-y-3 lg:space-y-4 mb-4 lg:mb-6">
                               <div className="h-2 w-1/3 bg-slate-700 rounded-full"></div>
                               <div className="h-2 w-3/4 bg-slate-700 rounded-full"></div>
                               <div className="h-2 w-1/2 bg-slate-700 rounded-full"></div>
                           </div>

                           <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-2 lg:p-3 rounded-lg mt-6 lg:mt-8">
                              <div className="bg-emerald-500 rounded-full p-1">
                                <Check size={10} className="text-white" strokeWidth={4} />
                              </div>
                              <span className="text-emerald-400 font-bold text-xs lg:text-sm tracking-wide">VERIFIERAD STUDENT</span>
                           </div>
                       </div>
                    </div>
                  </div>
              </div>
        </FeatureRow>

        {/* Feature 3: Integration */}
        <FeatureRow 
          flipped={true}
          tag="Integration"
          title="Sömlös systemkoppling"
          description="Arbeta kvar i era befintliga processer. Tack vare våra färdiga integrationer kopplar ni enkelt ihop CampusLyan direkt med ert nuvarande fastighetssystem för automatiserad publicering och hantering."
        >
            <div className="relative h-[350px] lg:h-[480px] bg-slate-50 rounded-[2.5rem] p-4 lg:p-8 flex items-center justify-center overflow-hidden border border-slate-200">
                
                <div className="flex items-center gap-2 md:gap-8 z-10 w-full max-w-lg justify-center scale-90 lg:scale-100">
                    
                    {/* System Box (Vänster) */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
                            <Server size={28} className="text-slate-400" />
                        </div>
                        <span className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-wider">Ert System</span>
                    </div>

                    {/* Connection Line & Animation */}
                    <div className="flex-1 h-px bg-slate-300 relative min-w-[40px] lg:min-w-[60px]">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1.5 lg:p-2 rounded-full border border-slate-200 z-10">
                             <ArrowRight size={14} className="text-emerald-500" />
                        </div>
                        <div className="absolute top-[-3px] left-0 w-2 h-2 bg-emerald-500 rounded-full animate-[moveRight_2s_linear_infinite]"></div>
                    </div>

                    {/* CampusLyan Box (Höger) */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center relative overflow-hidden">
                             <div className="absolute top-0 w-full h-4 bg-emerald-100/50"></div>
                             <AppWindow size={28} className="text-emerald-600" />
                        </div>
                        <span className="text-[10px] lg:text-xs font-bold text-emerald-600 uppercase tracking-wider">CampusLyan</span>
                    </div>

                </div>

                {/* Bakgrunds rutnät */}
                <div className="absolute inset-0 opacity-30" style={{ 
                    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
                    backgroundSize: '24px 24px' 
                }}></div>
            </div>
        </FeatureRow>
      </section>

      <section id="bokning" className="py-24 scroll-mt-24">
        <div className="px-6 max-w-7xl mx-auto mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Nyfiken på mer räckvidd?
          </h2>
          <p className="text-muted-foreground text-lg mt-2">
            Vi berättar gärna mer
          </p>
        </div>

        <div
          className="calendly-inline-widget w-full"
          data-url="https://calendly.com/campuslyan/30min?text_color=000000&hide_gdpr_banner=1&primary_color=004225"
          style={{ minWidth: "320px", height: "800px" }}
        />

        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="lazyOnload"
        />
      </section>

      {/* Global Styles & Keyframes */}
      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes slideUp {
            0% { transform: translateY(10px); opacity: 0; }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { transform: translateY(-10px); opacity: 0; }
        }
        @keyframes moveRight {
            0% { left: 0; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { left: 100%; opacity: 0; }
        }
      `}</style>

    </div>
  );
}