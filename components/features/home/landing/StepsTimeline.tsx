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
    <section className="relative overflow-hidden bg-background py-16 sm:py-20 lg:py-24">
      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Header Section */}
        <Reveal variant="up">
          <div className="mb-10 flex flex-col items-center space-y-4 text-center sm:mb-14 sm:space-y-6 lg:mb-24">
             {/* Vi använder din SectionBadge här för konsekvent stil */}
            <SectionBadge text={badge} />
            
            {heading ? (
               <h2 className="text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl md:text-6xl">
                 {heading}
               </h2>
            ) : (
              <h2 className="text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl md:text-6xl">
                Från registrering till <span className="text-pop-contrast">inflytt</span>.
              </h2>
            )}
          </div>
        </Reveal>

        {/* Steps Grid */}
        <div className="relative grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-3 lg:gap-12">
          
          {/* Connecting Line (Desktop only) - Ligger bakom korten */}
          <div className="absolute left-[16%] right-[16%] top-10 -z-10 hidden h-0.5 border-t-2 border-dashed border-border opacity-60 md:block lg:top-12" />

          {steps.map((step, idx) => (
            <Reveal key={step.title} variant="up" delay={idx * 150}>
              <div className="relative flex flex-col items-center text-center group">
                
                {/* Number & Icon Circle */}
                <div className="relative mb-6 sm:mb-8">
                  <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card shadow-xl shadow-black/5 transition-all duration-300 group-hover:scale-105 group-hover:border-primary/30 sm:h-24 sm:w-24">
                    
                    {/* Nummerbadge */}
                    <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary text-xs font-bold text-primary-foreground shadow-lg sm:-right-2 sm:-top-2 sm:h-8 sm:w-8 sm:text-sm">
                      {idx + 1}
                    </div>
                    
                    {/* Ikon */}
                    <step.icon className="h-7 w-7 text-primary opacity-80 transition-transform duration-300 group-hover:scale-110 group-hover:opacity-100 sm:h-8 sm:w-8" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3 px-2 sm:space-y-4 sm:px-4">
                  <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-foreground sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
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
