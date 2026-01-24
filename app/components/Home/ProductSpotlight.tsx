"use client";

import React from "react";
import Reveal from "@/lib/reveal";
import { Button } from "@heroui/button";
import { Search, Bell, GraduationCap, Key, Check, ChevronRight } from "lucide-react";

export default function ProductSpotlight() {
  return (
    <section className="relative overflow-hidden bg-background py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Text Content */}
          <Reveal variant="left">
            <div className="flex flex-col gap-8">
              
              <div className="inline-flex self-start px-4 py-1.5 rounded-full bg-secondary border border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-pop">
                  Plattformen
                </span>
              </div>

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                Allt du behöver för att <span className="text-primary dark:text-pop">bo & leva</span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                CampusLyan är mer än bara en bostadskö. Det är din personliga assistent genom hela studentlivet – från första sökningen till inflyttningsfesten.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                {[
                  { icon: Search, title: "Total överblick", desc: "Alla bostadsbolag samlade." },
                  { icon: Bell, title: "Bevakning", desc: "Notiser direkt i mobilen." },
                  { icon: GraduationCap, title: "Studentliv", desc: "Guider och spartips." },
                  { icon: Key, title: "Trygghet", desc: "Verifierade uthyrare." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary dark:text-pop">
                      <item.icon size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4">
                  <Button size="lg" className="font-bold bg-primary text-white rounded-full px-8">
                    Kom igång gratis <ChevronRight size={16} />
                  </Button>
              </div>
            </div>
          </Reveal>

          {/* Mockup UI */}
          <Reveal variant="right" delay={100}>
            <div className="relative mx-auto w-full max-w-[500px]">
              {/* Glow effect background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl -z-10"></div>

              {/* Card Container */}
              <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl p-6 md:p-8">
                 
                 {/* Mockup Header */}
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-secondary border border-border overflow-hidden relative">
                             {/* Placeholder avatar */}
                             <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-primary font-bold">A</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground font-bold uppercase">Välkommen</div>
                            <div className="text-foreground font-bold">Anna Andersson</div>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground">
                        <Bell size={18} />
                    </div>
                 </div>

                 {/* Mockup List */}
                 <div className="space-y-4">
                    <div className="bg-secondary/40 p-4 rounded-3xl border border-border/50 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-pop/20 text-pop flex items-center justify-center shrink-0">
                            <Check size={18} strokeWidth={3} />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-foreground">Profil verifierad</div>
                            <div className="text-xs text-muted-foreground">Du är redo att söka!</div>
                        </div>
                    </div>

                    <div className="bg-card p-5 rounded-3xl border border-border shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">Nytt objekt</span>
                            <span className="text-xs text-muted-foreground">2 min sen</span>
                        </div>
                        <h4 className="font-bold text-lg mb-1">Rum i kollektiv</h4>
                        <p className="text-sm text-muted-foreground mb-4">Göteborg, Johanneberg • 3800 kr</p>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-2/3 rounded-full"></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-wide">
                            <span>Matchning</span>
                            <span>84%</span>
                        </div>
                    </div>
                 </div>

              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}