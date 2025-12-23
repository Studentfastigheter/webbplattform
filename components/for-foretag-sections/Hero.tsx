"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@heroui/button";
import { 
  ChevronRight, 
  Zap,
  Home,
  Users,
  Search,
  TrendingUp
} from "lucide-react";

interface HeroProps {
  badge?: string;
  title?: React.ReactNode;
  description?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
}

export const Hero = ({ 
  title, 
  description, 
  primaryCtaText = "Anslut ditt system", 
  primaryCtaLink = "/boka-demo" 
}: HeroProps) => {

  const defaultTitle = (
    <span>
      Nå hela marknaden på – <span className="text-emerald-600">Sveriges ledande plattform</span>
    </span>
  );

  const defaultDescription = "Vi samlar landets alla studenter på ett ställe. Fyll dina vakanser snabbare genom att synas där studenterna faktiskt finns – enkelt integrerat med ditt nuvarande system.";

  return (
    <section className="relative z-10 pt-16 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center overflow-hidden lg:overflow-visible">
      
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-20">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold tracking-wide uppercase mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            För Fastighetsbolag
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] text-balance">
          {title || defaultTitle}
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium max-w-lg text-balance">
          {description || defaultDescription}
        </p>
        
        <div className="pt-2 flex flex-col sm:flex-row gap-4">
           <Button 
             as={Link}
             href={primaryCtaLink}
             className="bg-slate-900 text-white px-8 h-[56px] rounded-xl font-bold hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 group"
           >
             {primaryCtaText}
             <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </Button>
           
           <Button 
             as={Link}
             href={primaryCtaLink}
             className="bg-white border-2 border-slate-200 text-slate-700 px-8 h-[56px] rounded-xl font-bold hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center"
           >
             Läs mer
           </Button>
        </div>
      </div>

      <div className="relative h-[400px] lg:h-[500px] w-full flex items-center justify-center lg:justify-end mt-10 lg:mt-0 select-none">
          
          <div className="relative w-full max-w-[600px] h-full flex items-center justify-center">

            <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-emerald-400/20 via-emerald-200/10 to-transparent blur-3xl rounded-full"></div>

            <div className="relative w-[480px] bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-6 duration-700 overflow-hidden">
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Översikt</div>
                  <h3 className="text-xl font-black text-slate-900">Studentbostäder</h3>
                </div>
                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Visningar</div>
                  <div className="text-2xl font-black text-slate-900 mb-1">25.8k</div>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <TrendingUp className="w-3 h-3" />
                    +74%
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Klick</div>
                  <div className="text-2xl font-black text-slate-900 mb-1">6.4k</div>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <TrendingUp className="w-3 h-3" />
                    +61%
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Ansökningar</div>
                  <div className="text-2xl font-black text-slate-900 mb-1">852</div>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <TrendingUp className="w-3 h-3" />
                    +38%
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide">Visningar Senaste 7 Dagarna</div>
                <div className="relative h-32 flex items-end gap-2">
                  <div className="flex-1 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-lg relative overflow-hidden" style={{height: '25%'}}>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/40"></div>
                  </div>
                  <div className="flex-1 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-lg relative overflow-hidden" style={{height: '30%'}}>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/40"></div>
                  </div>
                  <div className="flex-1 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-lg relative overflow-hidden" style={{height: '45%'}}>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/40"></div>
                  </div>
                  <div className="flex-1 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-lg relative overflow-hidden" style={{height: '55%'}}>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/40"></div>
                  </div>
                  <div className="flex-1 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-lg relative overflow-hidden" style={{height: '65%'}}>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/40"></div>
                  </div>
                  <div className="flex-1 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-lg relative overflow-hidden" style={{height: '88%'}}>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/40"></div>
                  </div>
                  <div className="flex-1 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-lg relative overflow-hidden shadow-lg shadow-emerald-500/30" style={{height: '100%'}}>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/40"></div>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      Idag
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-emerald-500/5 rounded-3xl pointer-events-none"></div>
            </div>
          </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out 1s infinite;
        }
        .animate-float-delayed-2 {
          animation: float 6s ease-in-out 2s infinite;
        }
      `}</style>
    </section>
  );
};