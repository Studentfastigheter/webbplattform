import React from "react";
// Vi behöver inte importera Link här längre för mail-funktionen
import { Button } from "@heroui/button";
import { SectionBadge } from "@/components/ui/section-badge";

interface CtaSectionProps {
  title: string;
  description: string;
  primaryBtnText: string;
  primaryBtnLink: string;
}

export const CtaSection = ({
  title,
  description,
  primaryBtnText,
  primaryBtnLink,
}: CtaSectionProps) => {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto relative z-10">
      <div className="bg-primary rounded-[2rem] p-8 md:p-16 relative overflow-hidden shadow-xl">
        
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full pointer-events-none mix-blend-overlay"></div>

        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
          
          <div className="space-y-6 text-left">
            <div className="space-y-2">
              <SectionBadge text="Nästa steg" color="text-primary-foreground" />
              <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight leading-tight">
                {title}
              </h2>
              <p className="text-2xl md:text-4xl font-bold text-primary-foreground/80 tracking-tight leading-tight">
                {description}
              </p>
            </div>

            <div className="pt-4">
              {/* ÄNDRING HÄR: as="a" istället för as={Link} */}
              <Button
                as="a" 
                href={primaryBtnLink}
                className="bg-pop-contrast text-primary-foreground px-8 h-[56px] rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-lg tracking-wider uppercase"
              >
                {primaryBtnText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
