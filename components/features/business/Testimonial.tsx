"use client";

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';

export const Testimonials = () => {
  const testimonials = [
    {
      text: "CampusLyan är ett mycket efterfrågat initiativ som har potential att stärka studenters möjligheter att hitta boende i hela Sverige. Jag ser med stor förväntan på den fortsatta utvecklingen av plattformen och vilka värden den kan skapa för både studenter och uthyrare!",
      author: "Gabriella Näslund",
      role: "Vice Ordförande, SGS",
      logo: "https://data.maglr.com/3591/issues/38791/710263/assets/media/742c16fffc590c8be19450e83b031937d78d2a55a4c6ed72894c5080b7e133c2.jpg",
      alt: "Gabriella Näslund"
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

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
              Lyssna på era branschkollegor
            </h2>
          </div>

          <div className="hidden md:flex gap-3">
            <button 
              onClick={prevSlide}
              className="w-14 h-14 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-brand-beige-100 transition-colors text-foreground group"
              aria-label="Föregående"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={nextSlide}
              className="w-14 h-14 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-brand-beige-100 transition-colors text-foreground group"
              aria-label="Nästa"
            >
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        
        {/* Slider Window */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((item, index) => (
              <div key={index} className="w-full flex-shrink-0 pr-0 md:pr-4"> {/* En slide tar 100% bredd */}
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
                        {item.text}
                      </p>
                    </div>
                  </div>

                  {/* Footer med författare och logga */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 pt-2">
                    <div className="flex items-center gap-5 pl-6 border-l-4 border-brand-orange">
                      <img
                        src={item.logo}
                        alt={item.alt}
                        className="shrink-0 h-20 w-20 md:h-24 md:w-24 lg:h-38 lg:w-38 rounded-full object-cover border-4 border-white"
                      />
                      <div className="flex flex-col">
                        <div className="text-lg md:text-xl font-bold uppercase tracking-wider text-foreground mb-2">
                          {item.author}
                        </div>
                        <div className="text-sm md:text-base font-medium uppercase tracking-wide text-muted-foreground">
                          {item.role}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
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
              aria-label={`Gå till slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
