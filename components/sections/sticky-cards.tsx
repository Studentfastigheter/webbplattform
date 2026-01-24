import React from 'react';
import { SectionBadge } from '@/components/ui/section-badge';
import { Button } from '@/components/ui/button';

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
}

export const StickyCards = ({ 
  badge = "Vårt Erbjudande", // Defaultvärde
  heading, 
  cards = [] 
}: StickyCardsProps) => {

  if (!cards || cards.length === 0) return null;

  return (
    <section className="py-24 bg-brand-beige-200">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          {badge && <SectionBadge text={badge} />}
          
          {/* Om heading finns, rendera den. Annars visa en default. */}
          {heading ? (
            <h2 className="text-4xl md:text-6xl font-bold text-foreground">
              {heading}
            </h2>
          ) : (
            <h2 className="text-4xl md:text-6xl font-bold text-foreground">
              Vi förenklar boenderesan.
            </h2>
          )}
        </div>

        <div className="space-y-12">
          {cards.map((card, idx) => (
            <div key={`${card.title}-${idx}`} className="sticky top-24 bg-card rounded-[2.5rem] border border-border shadow-xl overflow-hidden">
              <div className="flex flex-col lg:flex-row h-full">
                <div className="lg:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                  <h3 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">{card.title}</h3>
                  <div className="border-l-4 border-pop pl-6 mb-8">
                    <p className="text-lg text-muted-foreground leading-relaxed">{card.text}</p>
                  </div>
                  <div>
                    <Button variant="secondary">{card.ctaText || "Läs mer"}</Button>
                  </div>
                </div>
                <div className="lg:w-1/2 bg-brand-beige-100 flex items-center justify-center p-8 overflow-hidden">
                  <img 
                    src={card.img} 
                    alt={card.title} 
                    loading="lazy"
                    className="max-w-full max-h-[400px] object-contain transform hover:scale-105 transition-transform duration-700" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};