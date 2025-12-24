"use client";

import React from "react";
import Reveal from "@/lib/reveal"; // Behåller din Reveal-komponent
import { Button } from "@heroui/button";
import { 
  Search, 
  Bell, 
  GraduationCap, 
  Key, 
  CheckCircle2, 
  TrendingUp, 
  MoreHorizontal,
  User
} from "lucide-react";

export default function ProductSpotlight() {
  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-24">
      
      {/* Bakgrundsdekoration (samma stil som Hero) */}
      <div className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-full h-full overflow-hidden">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-3xl -z-10"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Vänster sida: Text & Features */}
          <Reveal variant="left">
            <div className="flex flex-col gap-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-bold tracking-wide uppercase self-start">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Plattformen
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.1]">
                Allt du behöver för att <br className="hidden lg:block"/> 
                <span className="text-emerald-600">hitta eller hyra ut</span>
              </h2>
              
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
                CampusLyan samlar studentbostäder från landets största bostadsbolag och kommunala köer i ett flöde. Inom kort öppnar vi även för trygg privatuthyrning.
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {[
                  {
                    icon: Search,
                    title: "Total överblick",
                    desc: "Vi samlar alla lediga objekt från alla bostadsbolag åt dig."
                  },
                  {
                    icon: Bell,
                    title: "Smartare bevakning",
                    desc: "Få notiser direkt när objekt som matchar din profil dyker upp."
                  },
                  {
                    icon: GraduationCap,
                    title: "Allt för studentlivet",
                    desc: "Guider om köregler, hyresavtal och spartips för studenter."
                  },
                  {
                    icon: Key,
                    title: "Trygg uthyrning",
                    desc: "Snart kan du hyra ut ditt rum säkert till verifierade studenter."
                  }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-emerald-100 transition-all duration-300">
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <feature.icon size={20} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Höger sida: Mockup Dashboard */}
          <Reveal variant="right" delay={120}>
            <div className="relative mx-auto w-full max-w-[500px]">
              
              {/* Bakgrunds gradient blob bakom kortet */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 to-slate-100/40 blur-2xl transform rotate-3 rounded-[3rem]"></div>

              {/* Huvudkort */}
              <div className="relative bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-6 overflow-hidden">
                
                {/* Header i Mockup */}
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Inloggad som</div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      Anna Andersson
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    </div>
                  </div>
                  <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    <span className="text-xs font-bold text-slate-600">Uthyrarpanel</span>
                  </div>
                </div>

                {/* Sektion: Mina Annonser */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Mina annonser</h3>
                    <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Ny annons +</button>
                  </div>

                  {/* Annons Kort 1 (Aktiv) */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-emerald-200 transition-colors group cursor-default">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">Aktiv</div>
                        <h4 className="font-bold text-slate-900 text-sm">1:a i Vasastan</h4>
                        <p className="text-xs text-slate-500">25 m² • 6 200 kr/mån</p>
                      </div>
                      <MoreHorizontal size={16} className="text-slate-400 cursor-pointer hover:text-slate-600" />
                    </div>
                    <div className="flex gap-4 border-t border-slate-200/60 pt-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                         <TrendingUp size={12} className="text-emerald-500" />
                         <strong>1,284</strong> visningar
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                         <User size={12} className="text-emerald-500" />
                         <strong>37</strong> intressen
                      </div>
                    </div>
                  </div>

                  {/* Annons Kort 2 (Utkast) */}
                  <div className="bg-white border border-dashed border-slate-300 rounded-xl p-4 opacity-75 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full inline-block mb-1">Utkast</div>
                        <h4 className="font-bold text-slate-900 text-sm">Rum i Guldheden</h4>
                        <p className="text-xs text-slate-500">Slutför din annons för att publicera</p>
                      </div>
                      <MoreHorizontal size={16} className="text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Sektion: Senaste ansökningar */}
                <div>
                   <h3 className="text-sm font-bold text-slate-900 mb-3">Nyligen intresserade</h3>
                   <div className="space-y-2">
                      {[
                        { name: "Elin", desc: "Civilingenjör, KTH", time: "2 min" },
                        { name: "Victor", desc: "Ekonomistudent, Handels", time: "15 min" }
                      ].map((person, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                {person.name[0]}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <span className="text-xs font-bold text-slate-900">{person.name}</span>
                                    <span className="text-[10px] text-slate-400">{person.time}</span>
                                </div>
                                <p className="text-[10px] text-slate-500">{person.desc}</p>
                            </div>
                        </div>
                      ))}
                   </div>
                   
                   <Button
                      size="sm"
                      className="w-full mt-4 font-bold bg-slate-900 text-white hover:bg-emerald-600 rounded-xl h-10 shadow-lg shadow-slate-900/10 transition-all"
                    >
                      Hantera ansökningar
                    </Button>
                </div>

              </div>
              
              {/* Dekorativa element bakom */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl -z-10 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400/10 rounded-full blur-xl -z-10"></div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}