import React from 'react';
import { Button } from '@/components/ui/button';
import { SectionBadge } from '@/components/ui/section-badge';
import Image from 'next/image';

export const Implementation = () => {
  const steps = [
    {
      num: "01",
      title: "Projektuppstart",
      desc: "En tydlig uppstart är en förutsättning för en enkel och smidig process. Här går vi igenom projektets omfattning, målsättning och resursallokering."
    },
    {
      num: "02",
      title: "Planering och genomförande",
      desc: "Vi definierar design för varumärkesanpassning, konfigurerar vår lösning och verifierar och testar alla integrationer till övriga system."
    },
    {
      num: "03",
      title: "Utrullning",
      desc: "Kommunikationen kickstartar utrullningen, där boende får ladda ned sin app och börja använda funktionerna. Vi bistår med kommunikationsmaterial, kanalval och internutbildning i vårt verktyg."
    },
    {
      num: "04",
      title: "Löpande samarbete",
      desc: "Det slutar inte här. Efter utrullningen fortsätter vi som din digitala partner, med fokus på kundengagemang, konvertering och kontinuerliga förbättringar för bästa resultat och kundnöjdhet."
    }
  ];

  return (
    <section className="py-24 bg-primary">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">
          
          {/* Vänster kolumn - Sticky */}
          <div className="lg:w-5/12">
            <div className="sticky top-32">
              {/* Vertikal linje och innehåll */}
              <div className="pl-8 md:pl-12 border-l-2 border-white/10">
                <SectionBadge 
                  text="Implementation" 
                  color="text-brand-green-light" 
                  className="tracking-[0.12em]" 
                />
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-brand-beige-100 leading-[1.1]">
                  Vi hjälper er i varje steg på vägen
                </h2>
                
                {/* Person-profil */}
                <div className="flex items-center gap-4 mt-8">
                  <Image 
                    src="/team/Profilbild-Alvin.png" 
                    alt="Alvin"
                    width={56} 
                    height={56}
                    className="rounded-full border-2 border-transparent object-cover"
                  />
                  <div>
                    <div className="font-bold uppercase text-sm tracking-wide text-brand-beige-100 mb-1">
                      ALvin Stallgård
                    </div>
                    <div className="text-xs font-medium uppercase tracking-wide text-brand-beige-100/70">
                      Head of customer success
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Höger kolumn - Steg för steg */}
          <div className="lg:w-7/12">
            <div className="flex flex-col">
              {steps.map((step, index) => (
                <div key={index}>
                  <div className="grid grid-cols-[min-content_1fr] gap-6 md:gap-10 py-4">
                    {/* Siffran */}
                    <div className="text-[4rem] md:text-[6.25rem] font-bold text-brand-green-light leading-none">
                      {step.num}
                    </div>
                    
                    {/* Texten */}
                    <div className="pt-2 md:pt-4 max-w-[430px]">
                      <h3 className="text-2xl md:text-3xl font-bold text-brand-beige-100 mb-3 md:mb-4">
                        {step.title}
                      </h3>
                      <p className="text-brand-beige-100/90 text-base md:text-lg leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Divider (visas inte efter sista elementet om man vill vara exakt, men Avys kod hade dividers mellan blocken) */}
                  {index !== steps.length - 1 && (
                    <div className="h-px bg-white/10 w-full my-10 md:my-14" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};