"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { getBusinessTestimonials } from '@/data/businessTestimonials';
import { useI18n } from '@/i18n/I18nProvider';
import { localizedText } from '@/i18n/text';

export const Testimonials = () => {
  const { locale } = useI18n();
  const testimonials = getBusinessTestimonials(locale);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselItems =
    testimonials.length > 1
      ? [testimonials[testimonials.length - 1], ...testimonials, testimonials[0]]
      : testimonials;
  const activeTrackIndex = testimonials.length > 1 ? currentIndex + 1 : currentIndex;
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    slideRefs.current[activeTrackIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeTrackIndex]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative">
        
        {/* Header och Pilar Container */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              {localizedText(locale, "Lyssna på era branschkollegor", "Hear from your industry peers")}
            </h2>
          </div>

          <div className="hidden md:flex gap-3">
            <button 
              onClick={prevSlide}
              className="w-14 h-14 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-brand-beige-100 transition-colors text-foreground group"
              aria-label={localizedText(locale, "Föregående", "Previous")}
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={nextSlide}
              className="w-14 h-14 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-brand-beige-100 transition-colors text-foreground group"
              aria-label={localizedText(locale, "Nästa", "Next")}
            >
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        
        {/* Slider Window */}
        <div
          className="flex snap-x gap-4 overflow-x-auto scroll-smooth px-0 [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden"
        >
          {carouselItems.map((item, index) => {
            const isActive = index === activeTrackIndex;

            return (
              <div
                key={`${item.authorName}-${index}`}
                ref={(node) => {
                  slideRefs.current[index] = node;
                }}
                className={`w-full flex-shrink-0 basis-[calc(100%_-_3rem)] snap-center transition-opacity duration-500 sm:basis-[88%] md:basis-[82%] lg:basis-[76%] xl:basis-[72%] ${
                  isActive ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div className="bg-brand-beige-100 p-8 md:p-16 rounded-[2rem] text-left h-full flex flex-col justify-between">
                  
                  <div>
                    {/* Citat-symbol */}
                    <div className="mb-8">
                      <Quote
                        className="h-10 w-10 md:h-12 md:w-12 text-primary"
                        strokeWidth={2.25}
                        aria-hidden="true"
                      />
                    </div>
                    
                    {/* Citat-text */}
                    <div className="mb-12">
                      <p className="text-xl md:text-2xl lg:text-[1.75rem] text-foreground font-medium leading-[1.4]">
                        {item.quote}
                      </p>
                    </div>
                  </div>

                  {/* Footer med författare och logga */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 pt-2">
                    <div className="flex items-center gap-6 pl-6 border-l-4 border-brand-orange">
                      <img
                        src={item.portraitSrc}
                        alt={item.portraitAlt}
                        className="shrink-0 h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 rounded-full object-cover border-4 border-white"
                      />
                      <div className="flex flex-col">
                        <div className="text-lg md:text-xl font-bold uppercase tracking-wider text-foreground mb-2">
                          {item.authorName}
                        </div>
                        <div className="text-sm md:text-base font-medium uppercase tracking-wide text-muted-foreground">
                          {item.title}
                        </div>
                      </div>
                    </div>

                    {item.companyLogoSrc && (
                      <div className="flex h-20 w-56 items-center justify-start sm:h-24 sm:w-64 sm:justify-end">
                        <img
                          src={item.companyLogoSrc}
                          alt={item.companyLogoAlt ?? item.companyName}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
        {/* Mobile Dots Navigation (Visas endast på mobil) */}
        <div className="flex justify-center gap-3 mt-8 md:hidden">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'bg-foreground w-8' : 'bg-foreground/20 w-2.5'
              }`}
              aria-label={localizedText(locale, `Gå till slide ${idx + 1}`, `Go to slide ${idx + 1}`)}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
