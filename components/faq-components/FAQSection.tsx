'use client';

import React, { useState } from 'react';
import { Plus, Minus, ArrowUpRight } from 'lucide-react';

// Datastruktur baserad på din HTML-text
const faqItems = [
  {
    question: "Vad är Avy?",
    answer: (
      <>
        Avy är en digital boendeplattform som samlar allt som rör en hyresgästs boende på ett och samma ställe. Genom Avy kan du som hyresgäst eller fastighetsägare- och förvaltare enkelt hantera ärenden som hyresbetalningar, felanmälningar, bokningar av gemensamma utrymmen och kommunikation.
      </>
    )
  },
  {
    question: "Hur kommer jag igång med Avy?",
    answer: (
      <>
        <strong className="block mb-2 text-foreground">Fastighetsägare- och förvaltare:</strong>
        Kontakta Avy <a href="#" className="underline hover:text-primary">här</a> för ett första möte.
        <br /><br />
        <strong className="block mb-2 text-foreground">Boende:</strong>
        För att börja använda Avy, ladda ner "Boendeappen Avy" från App Store eller Google Play. Efter nedladdning loggar du in med BankID eller annan verifieringsmetod som din hyresvärd eller bostadsrättsförening har valt.
      </>
    )
  },
  {
    question: "Vilka funktioner erbjuder Avy?",
    answer: (
      <>
        Avy erbjuder en rad funktioner för att underlätta och effektivisera boendeupplevelsen, inklusive:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Digital hyresbetalning</li>
          <li>Felanmälan och ärendehantering</li>
          <li>Bokning av gemensamma resurser som tvättstuga eller övernattningslägenhet</li>
          <li>Kommunikation med hyresvärd</li>
          <li>Tillgång till boenderelaterade tjänster och erbjudande</li>
        </ul>
        <br />
        Observera att tillgängliga funktioner kan variera beroende på vad din hyresvärd eller fastighetsförvaltare har aktiverat för just din fastighet.
      </>
    )
  },
  {
    question: "Hur gör jag en felanmälan via Avy?",
    answer: (
      <>
        <strong>För boende:</strong> För att göra en felanmälan, logga in i appen och navigera till sektionen för felanmälningar. Fyll i detaljer om problemet och skicka in din anmälan. Du kan sedan följa statusen för ditt ärende direkt i appen.
      </>
    )
  },
  {
    question: "Kan jag boka gemensamma utrymmen genom Avy?",
    answer: (
      <>
        <strong>För boende:</strong> Ja, om din hyresvärd har aktiverat denna funktion kan du boka gemensamma utrymmen som tvättstuga, övernattningslägenhet eller mötesrum direkt via appen.
      </>
    )
  },
  {
    question: "Är mina personuppgifter säkra i Avy?",
    answer: (
      <>
        <strong>För boende:</strong> Ja, Avy följer gällande dataskyddslagar och använder säkerhetstekniker för att skydda dina personuppgifter. För mer information, se vår <a href="https://terms.avy.se/privacy/1.1/en/" target="_blank" className="underline hover:text-primary">integritetspolicy</a> på avy.se.
      </>
    )
  },
  {
    question: "Kostar det något att använda Avy?",
    answer: (
      <>
        <strong className="block mb-2 text-foreground">För Fastighetsägare- och förvaltare:</strong>
        Ja. Kontakta Avy <a href="#" className="underline hover:text-primary">här</a> för ett första möte.
        <br /><br />
        <strong className="block mb-2 text-foreground">För boende:</strong>
        Avy är kostnadsfri för dig som boende. Eventuella kostnader för specifika tjänster eller erbjudanden inom appen framgår tydligt innan du väljer att använda dem.
      </>
    )
  }
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Första öppen som standard, sätt till null om alla ska vara stängda

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="FAQ" className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header: Titel till vänster, Knapp till höger */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          
          {/* Titel med grön vänster-border */}
          <div className="pl-6 md:pl-8 border-l-[3px] border-pop">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Vanliga frågor (FAQ)
            </h2>
          </div>

          {/* Hjälpcenter-knapp */}
          <a 
            href="https://avyenduser.zendesk.com/hc/sv" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 transition-colors w-fit"
          >
            <span>Till hjälpcenter</span>
            <ArrowUpRight size={18} />
          </a>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col gap-4">
          {faqItems.map((item, index) => (
            <div 
              key={index}
              onClick={() => toggleFAQ(index)}
              className={`group bg-white rounded-2xl transition-all duration-300 cursor-pointer border border-transparent hover:shadow-lg ${openIndex === index ? 'shadow-lg ring-1 ring-border' : ''}`}
            >
              {/* Header (Fråga + Ikon) */}
              <div className="flex justify-between items-center p-6 md:p-8">
                <h3 className={`text-xl md:text-2xl font-bold transition-colors ${openIndex === index ? 'text-primary' : 'text-foreground'}`}>
                  {item.question}
                </h3>
                
                {/* Ikon-cirkel */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${openIndex === index ? 'bg-primary text-white' : 'bg-brand-beige-100 text-foreground group-hover:bg-primary group-hover:text-white'}`}>
                  {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                </div>
              </div>

              {/* Body (Svar) - Animerad höjd */}
              <div 
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 md:px-8 pb-8 pt-0 text-muted-foreground leading-relaxed text-lg max-w-3xl">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FAQSection;