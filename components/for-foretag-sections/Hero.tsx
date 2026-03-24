"use client";

import React from "react";
import { ChevronRight, TrendingUp } from "lucide-react";

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
    <section className="relative z-10 pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-20 items-center overflow-hidden">
      
      <div className="space-y-4 sm:space-y-6 md:space-y-8 relative z-20">
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-bold tracking-wide uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          För Fastighetsbolag
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
          {title || defaultTitle}
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-medium max-w-lg">
          {description || defaultDescription}
        </p>
        
        {/* --- HÄR ÄR ÄNDRINGEN --- */}
        {/* Ändrat från flex-col till flex-row för att tvinga dem brevid varandra */}
        <div className="pt-2 flex flex-row gap-3 sm:gap-4">
          <button 
            className="flex-1 sm:flex-none bg-slate-900 text-white px-4 sm:px-8 h-12 sm:h-14 rounded-xl font-bold hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 group text-sm sm:text-base whitespace-nowrap"
          >
            {primaryCtaText}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
           
          <button 
            className="flex-1 sm:flex-none bg-white border-2 border-slate-200 text-slate-700 px-4 sm:px-8 h-12 sm:h-14 rounded-xl font-bold hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center text-sm sm:text-base whitespace-nowrap"
          >
            Läs mer
          </button>
        </div>
        {/* ------------------------- */}

      </div>

      <div className="relative h-[320px] sm:h-[400px] md:h-[450px] lg:h-[500px] w-full flex items-center justify-center lg:justify-end mt-6 sm:mt-8 lg:mt-0 select-none">
          
        <div className="relative w-full max-w-[280px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] h-full flex items-center justify-center">

          <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[200px] sm:w-[300px] md:w-[400px] lg:w-[500px] h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] bg-gradient-to-br from-emerald-400/20 via-emerald-200/10 to-transparent blur-3xl rounded-full"></div>

          <div className="relative w-full max-w-[280px] sm:max-w-[360px] md:max-w-[440px] lg:max-w-[480px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 p-4 sm:p-5 md:p-6 overflow-hidden">
            
            <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
              <div>
                <div className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Översikt</div>
                <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900">Studentbostäder</h3>
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-xs font-bold flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
                </span>
                Live
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
              <div className="bg-slate-50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-slate-200">
                <div className="text-[8px] sm:text-[9px] md:text-xs font-semibold text-slate-500 mb-0.5 sm:mb-1 uppercase tracking-wide">Visningar</div>
                <div className="text-sm sm:text-xl md:text-2xl font-black text-slate-900 mb-0.5 sm:mb-1">25.8k</div>
                <div className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-xs font-bold text-emerald-600">
                  <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3" />
                  +74%
                </div>
              </div>

              <div className="bg-slate-50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-slate-200">
                <div className="text-[8px] sm:text-[9px] md:text-xs font-semibold text-slate-500 mb-0.5 sm:mb-1 uppercase tracking-wide">Klick</div>
                <div className="text-sm sm:text-xl md:text-2xl font-black text-slate-900 mb-0.5 sm:mb-1">6.4k</div>
                <div className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-xs font-bold text-emerald-600">
                  <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3" />
                  +61%
                </div>
              </div>

              <div className="bg-slate-50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-slate-200">
                <div className="text-[8px] sm:text-[9px] md:text-xs font-semibold text-slate-500 mb-0.5 sm:mb-1 uppercase tracking-wide">Ansökn.</div>
                <div className="text-sm sm:text-xl md:text-2xl font-black text-slate-900 mb-0.5 sm:mb-1">852</div>
                <div className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-xs font-bold text-emerald-600">
                  <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3" />
                  +38%
                </div>
              </div>
            </div>

            <div className="mb-0">
              <div className="text-[8px] sm:text-[9px] md:text-xs font-bold text-slate-600 mb-2 sm:mb-3 uppercase tracking-wide">Visningar Senaste 7 Dagarna</div>
              <div className="relative h-20 sm:h-24 md:h-32 flex items-end gap-1 sm:gap-1.5 md:gap-2">
                {[25, 30, 45, 55, 65, 88, 100].map((height, i) => (
                  <div 
                    key={i}
                    className="flex-1 bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-lg relative overflow-hidden" 
                    style={{height: `${height}%`}}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/40"></div>
                    {i === 6 && (
                      <>
                        <div className="absolute inset-0 shadow-lg shadow-emerald-500/30 rounded-t-lg"></div>
                        <div className="absolute -top-4 sm:-top-5 md:-top-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[7px] sm:text-[8px] md:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                          Idag
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-emerald-500/5 rounded-2xl sm:rounded-3xl pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
};