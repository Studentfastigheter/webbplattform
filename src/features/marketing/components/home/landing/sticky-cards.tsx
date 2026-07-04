import React from 'react';

// 1. Definiera hur ett "Kort" ser ut
interface CardItem {
  title: string;
  text: string;
  img: string;
  ctaText?: string; // Valfri text på knappen (default "Läs mer")
}

// 2. Definiera vad komponenten tar emot (Props)
interface StickyCardsProps {
  heading?: React.ReactNode; // Rubriken (kan vara text eller HTML/JSX)
  cards?: CardItem[];       // Listan med kort
  sectionClassName?: string;
}

export const StickyCards = ({ 
  heading, 
  cards = [],
  sectionClassName = "bg-brand-beige-200",
}: StickyCardsProps) => {

  if (!cards || cards.length === 0) return null;

  return (
    <section className={`py-16 sm:py-20 lg:py-24 ${sectionClassName}`}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center sm:mb-12 lg:mb-16">
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
          {cards.map((card, idx) => {
            // Utan bild får texten hela kortbredden — ingen tom reserverad
            // bildhalva (kortet såg halvfärdigt ut på desktop).
            const hasImage = Boolean(card.img?.trim());

            return (
              <div key={`${card.title}-${idx}`} className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl lg:sticky lg:top-24 lg:rounded-[2.5rem]">
                <div className="flex h-full flex-col lg:flex-row">
                  <div
                    className={`flex flex-col justify-center p-6 sm:p-8 md:p-12 lg:p-16 ${
                      hasImage ? "lg:w-1/2" : "w-full"
                    }`}
                  >
                    <h3 className="mb-4 text-2xl font-bold text-foreground sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl">{card.title}</h3>
                    <div className={`border-l-4 border-pop-contrast pl-4 sm:pl-6 ${hasImage ? "mb-6 sm:mb-8" : ""}`}>
                      <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">{card.text}</p>
                    </div>
                  </div>
                  {hasImage ? (
                    <div className="flex items-center justify-center overflow-hidden bg-card p-4 sm:p-6 md:p-8 lg:w-1/2">
                      <img
                        src={card.img}
                        alt={card.title}
                        loading="lazy"
                        className="max-h-[260px] max-w-full object-contain transition-transform duration-700 hover:scale-105 sm:max-h-[320px] md:max-h-[400px]"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
