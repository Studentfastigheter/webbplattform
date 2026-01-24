"use client";

import React, { useRef, useEffect, useState } from 'react';
import { SectionBadge } from '@/components/ui/section-badge';

// --- Helper för animationer (Fade In on Scroll) ---
const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${className} ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const ValueBento = () => {
  return (
    <section className="py-24 bg-primary text-brand-beige-100 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <FadeIn>
            <SectionBadge text="Värdeskapande" color="text-brand-green-light" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              En förbättrad boendeupplevelse. <br />
              <span className="text-brand-green-light">För alla.</span>
            </h2>
            <p className="text-lg md:text-xl text-brand-beige-100 font-light leading-relaxed">
              Avy Boendeplattform förenklar administration, stärker boendedialogen och effektiviserar förvaltningen – samtidigt som den öppnar nya affärsmöjligheter.
            </p>
          </FadeIn>
        </div>

        {/* BENTO GRID 
           Avy använder en 5-kolumns grid. 
           Vi återskapar den med CSS Grid: grid-cols-1 (mobil) -> grid-cols-2 (tablet) -> grid-cols-5 (desktop).
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 auto-rows-[minmax(300px,auto)]">
          
          {/* 1. Abstract Image (Vänster kant) - 1 col */}
          <div className="lg:col-span-1 hidden lg:block">
             <FadeIn delay={100} className="h-full">
               <div className="w-full h-full rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group">
                 {/* Dekorativ bild-placeholder då originalet är en CSS-bg */}
                 <div className="absolute inset-0 opacity-30 bg-[url('https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/67ac690aef4c9a3f76854257_Davy%20small%20SE.png')] bg-cover bg-center filter blur-sm scale-110"></div>
               </div>
             </FadeIn>
          </div>

          {/* 2. Copilot Davy (Stor bild) - 2 cols */}
          <div className="md:col-span-2 lg:col-span-2">
             <FadeIn delay={200} className="h-full">
               <a href="#" className="block w-full h-full rounded-2xl overflow-hidden relative group cursor-pointer">
                 <div 
                   className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                   style={{ backgroundImage: 'url("https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/67ac690aef4c9a3f76854257_Davy%20small%20SE.png")' }}
                 />
                 <div className="absolute top-4 left-4">
                    <span className="inline-block px-4 py-2 rounded-full bg-brand-green-light text-primary text-xs font-bold uppercase tracking-wide">
                      Copilot Davy
                    </span>
                 </div>
               </a>
             </FadeIn>
          </div>

          {/* 3. Statistik 61% (Grön box) - 1 col */}
          <div className="lg:col-span-1">
            <FadeIn delay={300} className="h-full">
              <div className="w-full h-full bg-brand-green-light rounded-2xl p-8 flex flex-col justify-center relative transition-transform hover:-translate-y-1 duration-300">
                <h3 className="text-5xl lg:text-6xl font-bold text-primary mb-4">61%</h3>
                <p className="text-primary font-bold text-sm leading-snug">
                  av alla frågor från boende hanteras direkt av Davy.
                </p>
              </div>
            </FadeIn>
          </div>

          {/* 4. Abstract Image (Höger kant) - 1 col */}
          <div className="lg:col-span-1 hidden lg:block">
             <FadeIn delay={400} className="h-full">
               <div className="w-full h-full rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-brand-green-light to-transparent"></div>
               </div>
             </FadeIn>
          </div>

          {/* --- RAD 2 --- */}

          {/* 5. Kundinsikter (Stor bild) - 2 cols */}
          <div className="md:col-span-2 lg:col-span-2">
             <FadeIn delay={200} className="h-full">
               <a href="#" className="block w-full h-full rounded-2xl overflow-hidden relative group cursor-pointer">
                 <div 
                   className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                   style={{ backgroundImage: 'url("https://cdn.prod.website-files.com/673c77fb9e60433ef22d4b0f/67e13c0a088b23ff43a17116_Data%20and%20analysis%20image.png")' }}
                 />
                 <div className="absolute top-4 left-4">
                    <span className="inline-block px-4 py-2 rounded-full bg-brand-orange text-brand-dark text-xs font-bold uppercase tracking-wide">
                      Kundinsikter
                    </span>
                 </div>
               </a>
             </FadeIn>
          </div>

          {/* 6. Statistik 72% (Beige box) - 1 col */}
          <div className="lg:col-span-1">
            <FadeIn delay={300} className="h-full">
              <div className="w-full h-full bg-brand-beige-200 rounded-2xl p-8 flex flex-col justify-center relative transition-transform hover:-translate-y-1 duration-300">
                <h3 className="text-5xl lg:text-6xl font-bold text-brand-orange mb-4">72%</h3>
                <p className="text-brand-dark font-bold text-sm leading-snug">
                  är mycket nöjda med svaret de fick från Davy.
                </p>
              </div>
            </FadeIn>
          </div>

          {/* 7. Citat (Stor box) - 2 cols */}
          <div className="md:col-span-2 lg:col-span-2">
            <FadeIn delay={400} className="h-full">
              <div className="w-full h-full bg-brand-beige-200 rounded-2xl p-8 md:p-10 flex flex-col justify-center">
                <p className="text-lg md:text-xl text-brand-dark font-medium leading-relaxed mb-6">
                  "För oss är det viktigt att driva innovation i förvaltningen och leverera en bra service till våra kunder, Avy hjälper oss med detta!"
                </p>
                <div>
                  <div className="text-brand-dark font-bold uppercase text-xs tracking-wider mb-1">
                    Daniel Svartling
                  </div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wide font-medium">
                    Wallenstam AB
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
};