import React from 'react';
import { SectionBadge } from '@/components/ui/section-badge';

// 1. Definiera hur ett "Kort" ser ut
interface CardItem {
  title: string;
  text: string;
  img: string;
  ctaText?: string; // Valfri text på knappen (default "Läs mer")
}

// 2. Definiera vad komponenten tar emot (Props)
interface StickyCardsProps {
  badge?: string;           // Texten i badgen
  heading?: React.ReactNode; // Rubriken (kan vara text eller HTML/JSX)
  cards?: CardItem[];       // Listan med kort
  sectionClassName?: string;
}

export const StickyCards = ({ 
  badge = "Vårt Erbjudande", // Defaultvärde
  heading, 
  cards = [],
  sectionClassName = "bg-brand-beige-200",
}: StickyCardsProps) => {

  if (!cards || cards.length === 0) return null;

  return (
    <section className={`py-16 sm:py-20 lg:py-24 ${sectionClassName}`}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center sm:mb-12 lg:mb-16">
          {badge && <SectionBadge text={badge} />}
          
          {/* Om heading finns, rendera den. Annars visa en default. */}
          {heading ? (
            <h2 className="text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl md:text-6xl">
              {heading}
            </h2>
          ) : (
            <h2 className="text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl md:text-6xl">
              Vi förenklar boenderesan.
            </h2>
          )}
        </div>

        <div className="space-y-6 sm:space-y-8 lg:space-y-12">
          {cards.map((card, idx) => (
            <div key={`${card.title}-${idx}`} className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl lg:sticky lg:top-24 lg:rounded-[2.5rem]">
              <div className="flex flex-col lg:flex-row h-full">
                <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12 lg:w-1/2 lg:p-16">
                  <h3 className="mb-4 text-2xl font-bold text-foreground sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl">{card.title}</h3>
                  <div className="mb-6 border-l-4 border-pop-contrast pl-4 sm:mb-8 sm:pl-6">
                    <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{card.text}</p>
                  </div>
                </div>
                <div className={`items-center justify-center overflow-hidden bg-brand-beige-100 p-4 sm:p-6 md:p-8 lg:w-1/2 ${card.img?.trim() ? "flex" : "hidden sm:flex"}`}>
                  {card.img?.trim() ? (
                    <img 
                      src={card.img} 
                      alt={card.title} 
                      loading="lazy"
                      className="max-h-[260px] max-w-full object-contain transition-transform duration-700 hover:scale-105 sm:max-h-[320px] md:max-h-[400px]" 
                    />
                  ) : (
                    <div className="h-[180px] w-full rounded-2xl bg-gradient-to-br from-brand-beige-200 to-brand-beige-100 sm:h-[220px]" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
