"use client";

import React from "react";
import { 
  Users,
  ShieldCheck,
  Check,
  Search,
  ArrowRight,
  Server,
  AppWindow
} from "lucide-react";

import { Hero } from "@/components/for-foretag-sections/Hero";
import { CtaSection } from "@/components/for-foretag-sections/CtaSection";
import { Testimonials } from "@/components/sections/testimonials";
import { Features } from "@/components/sections/features";
import { Implementation } from "@/components/sections/implementation";
import { CtaBanner } from "@/components/sections/cta-banner";

// --- FEATURE ROW KOMPONENT ---
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
      {/* Text Section */}
      <div className="flex-1 space-y-4 text-left">
        {/* Badge */}
        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-pop font-bold uppercase tracking-wider text-xs mb-2">
          {tag}
        </div>
        
        {/* Titel */}
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
          {title}
        </h2>
        
        {/* Beskrivning */}
        <p className="text-muted-foreground text-lg leading-relaxed">
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
    // Base layout: bg-background text-foreground
    <div className="bg-background min-h-screen selection:bg-primary/20 selection:text-primary font-sans text-foreground">
      
      {/* --- HERO SEKTION --- */}
      <Hero 
        title={
          <span>
            Marknadsför till –{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pop">
              Sveriges studenter
            </span>
          </span>
        }
        description="Anslut ditt fastighetssystem och nå hela marknaden automatiskt. Vi verifierar studenterna enligt din kravprofil, så att du kan fylla vakanserna helt utan administration."
        primaryCtaText="Kom igång"
        primaryCtaLink="/om"
      />

      {/* --- MAIN CONTENT (Features) --- */}
      <section className="relative z-10 py-16 lg:py-32 px-6 max-w-7xl mx-auto space-y-24 lg:space-y-32">
        
        {/* Feature 1: Räckvidd */}
        <FeatureRow 
          flipped={true} 
          tag="Räckvidd"
          title="Den optimala marknadskanalen"
          description="Med CampusLyan når ni ut till alla studenter i Sverige på ett och samma ställe. Vi samlar studenterna i en gemensam plattform, vilket ger er maximal exponering mot rätt målgrupp utan onödigt spill."
        >
            {/* Visual Container */}
            <div className="relative h-[350px] lg:h-[480px] bg-secondary/50 dark:bg-card rounded-[2.5rem] p-4 lg:p-8 flex flex-col items-center justify-center overflow-hidden border border-border shadow-lg">
                
                {/* Abstrakt sökbar */}
                <div className="w-52 lg:w-64 h-10 lg:h-12 bg-background rounded-full shadow-sm border border-border flex items-center px-4 mb-6 lg:mb-8 z-20">
                    <Search className="text-pop w-4 h-4 lg:w-5 lg:h-5 mr-3" />
                    <div className="h-2 w-24 bg-muted rounded-full"></div>
                </div>

                {/* Matchningskort */}
                <div className="relative z-10 w-64 lg:w-72 space-y-3">
                    {/* Kort 1 - Ingen delay */}
                    <div className="bg-background p-3 lg:p-4 rounded-xl shadow-md border border-border flex items-center gap-4 animate-slide-up">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-secondary rounded-full flex items-center justify-center">
                            <Users size={18} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <div className="h-2 w-20 bg-foreground/80 rounded-full mb-2"></div>
                            <div className="h-1.5 w-12 bg-muted-foreground/50 rounded-full"></div>
                        </div>
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <Check size={14} className="text-pop" />
                        </div>
                    </div>

                    {/* Kort 2 - 1s delay */}
                    <div 
                      className="bg-background p-3 lg:p-4 rounded-xl shadow-md border border-border flex items-center gap-4 opacity-70 scale-95 animate-slide-up"
                      style={{ animationDelay: '1s' }}
                    >
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-secondary rounded-full flex items-center justify-center">
                            <Users size={18} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                             <div className="h-2 w-16 bg-foreground/80 rounded-full mb-2"></div>
                             <div className="h-1.5 w-10 bg-muted-foreground/50 rounded-full"></div>
                        </div>
                    </div>

                    {/* Kort 3 - 2s delay */}
                    <div 
                      className="bg-background p-3 lg:p-4 rounded-xl shadow-md border border-border flex items-center gap-4 opacity-40 scale-90 animate-slide-up"
                      style={{ animationDelay: '2s' }}
                    >
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-secondary rounded-full flex items-center justify-center">
                             <Users size={18} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                             <div className="h-2 w-24 bg-foreground/80 rounded-full mb-2"></div>
                             <div className="h-1.5 w-14 bg-muted-foreground/50 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Bakgrundsdekoration */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
            </div>
        </FeatureRow>

        {/* Feature 2: Verifiering */}
        <FeatureRow 
          flipped={false}
          tag="Kvalitetssäkring"
          title="Verifierade studenter – inga spökanvändare"
          description="Vi säkerställer att alla registrerade användare är aktiva studenter genom strikt verifiering. Detta eliminerar spökanvändare i era bostadsköer och garanterar att ni enbart hanterar ansökningar från behöriga sökande."
        >
              {/* Dark UI Card för systemkänsla */}
              <div className="relative h-[350px] lg:h-[480px] bg-[#0f172a] rounded-[2.5rem] p-4 lg:p-8 flex items-center justify-center overflow-hidden shadow-2xl shadow-black/20 group border border-slate-800">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                  
                  <div className="relative w-full max-w-sm">
                    <div className="relative bg-[#1e293b] rounded-2xl p-1 border border-slate-700 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-emerald-500/30">
                        <div className="bg-[#0f172a] rounded-xl p-4 lg:p-6 relative overflow-hidden">
                            {/* Scanning line animation */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] z-20 animate-scan"></div>

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
            <div className="relative h-[350px] lg:h-[480px] bg-secondary/50 dark:bg-card rounded-[2.5rem] p-4 lg:p-8 flex items-center justify-center overflow-hidden border border-border">
                
                <div className="flex items-center gap-2 md:gap-8 z-10 w-full max-w-lg justify-center scale-90 lg:scale-100">
                    
                    {/* System Box */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-background rounded-2xl shadow-sm border border-border flex items-center justify-center">
                            <Server size={28} className="text-muted-foreground" />
                        </div>
                        <span className="text-[10px] lg:text-xs font-bold text-muted-foreground uppercase tracking-wider">Ert System</span>
                    </div>

                    {/* Connection Line */}
                    <div className="flex-1 h-px bg-border relative min-w-[40px] lg:min-w-[60px]">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-1.5 lg:p-2 rounded-full border border-border z-10">
                             <ArrowRight size={14} className="text-pop" />
                        </div>
                        {/* Dot Animation */}
                        <div className="absolute top-[-3px] left-0 w-2 h-2 bg-pop rounded-full animate-move-right"></div>
                    </div>

                    {/* CampusLyan Box */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-primary/10 rounded-2xl shadow-sm border border-primary/20 flex items-center justify-center relative overflow-hidden">
                             <div className="absolute top-0 w-full h-4 bg-primary/20"></div>
                             <AppWindow size={28} className="text-pop" />
                        </div>
                        <span className="text-[10px] lg:text-xs font-bold text-pop uppercase tracking-wider">CampusLyan</span>
                    </div>

                </div>

                {/* Bakgrunds rutnät */}
                <div className="absolute inset-0 opacity-30 dark:opacity-10" style={{ 
                    backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', 
                    backgroundSize: '24px 24px',
                    color: 'var(--muted-foreground)'
                }}></div>
            </div>
        </FeatureRow>
      </section>
      
      
      <Features />
      <Implementation />
      <Testimonials />
      <CtaBanner />

      {/* Global Styles & Keyframes */}
      <style jsx global>{`
        /* Animations Definitions */
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slideUp 4s infinite;
        }
        .animate-move-right {
          animation: moveRight 2s linear infinite;
        }

        /* Keyframes */
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