import React from 'react';
import Reveal from "@/lib/reveal";
import { SectionBadge } from '@/components/ui/section-badge'; // Vi använder din gemensamma badge

interface StepItem {
  icon: React.ElementType;
  title: string;
  desc: string;
}

interface StepsTimelineProps {
  badge?: string;
  heading?: React.ReactNode;
  steps?: StepItem[];
}

export default function StepsTimeline({ 
  badge = "Så funkar det",
  heading,
  steps = []
}: StepsTimelineProps) {

  // Om ingen data skickas in, visa inget
  if (!steps || steps.length === 0) return null;

  return (
    <section className="relative py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        
        {/* Header Section */}
        <Reveal variant="up">
          <div className="flex flex-col items-center text-center space-y-6 mb-16 lg:mb-24">
             {/* Vi använder din SectionBadge här för konsekvent stil */}
            <SectionBadge text={badge} />
            
            {heading ? (
               <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1]">
                 {heading}
               </h2>
            ) : (
              <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1]">
                Från registrering till <span className="text-pop">inflytt</span>.
              </h2>
            )}
          </div>
        </Reveal>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 relative">
          
          {/* Connecting Line (Desktop only) - Ligger bakom korten */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 border-t-2 border-dashed border-border -z-10 opacity-60"></div>

          {steps.map((step, idx) => (
            <Reveal key={step.title} variant="up" delay={idx * 150}>
              <div className="relative flex flex-col items-center text-center group">
                
                {/* Number & Icon Circle */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full bg-card border border-border shadow-xl shadow-black/5 flex items-center justify-center relative z-10 group-hover:scale-105 group-hover:border-primary/30 transition-all duration-300">
                    
                    {/* Nummerbadge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg border-2 border-background">
                      {idx + 1}
                    </div>
                    
                    {/* Ikon */}
                    <step.icon size={32} className="text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4 px-4">
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-pop transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
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