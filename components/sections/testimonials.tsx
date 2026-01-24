"use client";

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const Testimonials = () => {
  const testimonials = [
    {
      text: "I MKBs kundlöfte lovar vi våra kunder ett tryggt boende och en enklare vardag. Genom Avys boendeapp får kunderna tillgång till funktioner och tjänster som verkligen underlättar i vardagen samt skapar trygghet då de kan kommunicera både med oss och sina grannar. I vår löpande kundenkät ser vi också att appen är oerhört uppskattad.",
      author: "Caroline Bergman",
      role: "Verksamhetsutvecklare",
      logo: "https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/675ad1fd2c9e85eb1300e3a7_MKB%20Logo%20black.png",
      alt: "MKBs logotyp"
    },
    {
      text: "Vi på Lundbergs Fastigheter vill ge våra hyresgäster den bästa boendeupplevelsen och med Avy har vi en god plattform att både skapa kommunikation samt kunna erbjuda boendetjänster och funktioner som gör det ännu smidigare att bo hos oss. Med Avy har vi hittat en långsiktig partner som precis som oss vill fortsätta utvecklingen.",
      author: "Christian Claesson",
      role: "Vice VD",
      logo: "https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/675ad20e85814b91ccb46e00_Lundbergs%20Logo%20black.png",
      alt: "Lundberg Fastigheter logotyp"
    },
    {
      text: "De har på kort tid bidragit till att utveckla vår kundplattform med hjälp av AI samt förbättrat vår digitala kommunikation. Deras expertis inom integrationer och API:er har varit värdefull och skapat en framtidssäkrad kundresa. SGS har en ung digital kundgrupp och vi ser fram emot att erbjuda kundupplevelse under dygnets alla timmar.",
      author: "Susanne Wallsten",
      role: "IT- och Säkerhetschef",
      logo: "https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/675ad364f51e4f6812b4fdc5_SGS%20Logo%20black.png",
      alt: "SGS studentbostäder logotyp"
    },
    {
      text: "Samarbetet med Avy har varit en game-changer för oss. Deras boendeapp har inte bara förenklat kommunikationen mellan våra medarbetare och hyresgäster, utan har också skapat en känsla av samhörighet hos våra hyresgäster och effektiviteten som vi eftersökte. Det är en resurs som verkligen har förbättrat vår verksamhet på flera nivåer.",
      author: "Samira Mchaiter",
      role: "Förvaltningschef",
      logo: "https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/675aced55c3542e7527c0b86_Studentbostader%20Logo%20black.png",
      alt: "Studentbostäder i Norden ABs logotyp"
    },
    {
      text: "Primula vill förbättra för våra hyresgäster genom att erbjuda en smidig digitaliserad boendeupplevelse. Vi har valt Avy för dess förmåga att kombinera en lättanvänd och intuitiv produkt med en lösning som är öppen och integrerar väl med de andra systemen. För oss innebär detta samarbete ett stort mervärde för våra hyresgäster.",
      author: "Hanna Swäläs Ek",
      role: "Förvaltningschef",
      logo: "https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/675ad38fd3176ac62cc11c09_Primula%20Logo%20black.png",
      alt: "Primulas logotyp"
    }
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

          {/* Desktop Navigation Arrows (Placerade uppe till höger precis som Avy) */}
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
                      <img 
                        src="https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/67459ca795594aeecb354bad_quote%20symbol.svg" 
                        alt="Quote symbol" 
                        className="w-10 md:w-12 opacity-100" 
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
                    <div className="flex flex-col pl-8 border-l-4 border-brand-orange">
                      <div className="text-lg md:text-xl font-bold uppercase tracking-wider text-foreground mb-2">
                        {item.author}
                      </div>
                      <div className="text-sm md:text-base font-medium uppercase tracking-wide text-muted-foreground">
                        {item.role}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <img 
                        src={item.logo} 
                        alt={item.alt} 
                        className="h-10 md:h-12 w-auto object-contain" 
                      />
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