"use client";

import React from "react";
import Link from "next/link";
import { ArrowDown, ShieldCheck, TrendingUp, Users } from "lucide-react";

export const TrustHero = () => {
  return (
    // bg-background text-foreground, border-border för dark mode stöd
    <section className="relative bg-background overflow-hidden">
      
      {/* --- Bakgrundseffekter (Subtil premium-känsla) --- */}
      {/* Dark mode: mörkare gradient eller ingen gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-beige-200 to-background pointer-events-none"></div>

      <div className="relative container mx-auto px-6 max-w-5xl pt-24 pb-20 lg:pt-32 lg:pb-24 text-center z-10">
        
        {/* --- Huvudrubrik --- */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8 text-balance">
          Vi skapar förtroende mellan <br className="hidden md:block"/>
          {/* Gradient text som funkar i light/dark (använder primary -> pop) */}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pop">
             studenter och bostadsmarknad.
          </span>
        </h1>

        {/* --- Ingress --- */}
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12">
          En plattform byggd för studenter, av studenter – i nära samarbete med landets ledande bostadsaktörer.
        </p>

        {/* --- Scroll Indicator --- */}
        <div className="animate-bounce text-muted-foreground/50 flex justify-center">
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