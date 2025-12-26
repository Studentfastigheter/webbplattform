"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Typer för datan
export interface PartnerItem {
  name: string;
  category: string;
  description: string;
  logoSrc: string; // Här förväntas nu bara filnamnet, t.ex. "logo.png"
  href: string;
}

interface PartnerGridProps {
  title: string;
  description: string;
  partners: PartnerItem[];
}

export const PartnerGrid = ({ title, description, partners }: PartnerGridProps) => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Rubrik och Introduktionstext --- */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 tracking-tight">
            {title}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* --- Partner Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col h-full transition-shadow hover:shadow-lg"
            >
              {/* Kategori-etikett i toppen */}
              <div className="mb-6">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  {partner.category}
                </span>
                <div className="mt-4 h-px bg-gray-100 w-full"></div>
              </div>

              {/* Logotyp-container */}
              <div className="h-32 flex items-center justify-center mb-8 px-4">
                 {partner.logoSrc ? (
                    /* HÄR ÄR ÄNDRINGEN */
                    /* Vi lägger till /nedladdare/ före filnamnet */
                    <img 
                      src={`/logos/${partner.logoSrc}`} 
                      alt={`${partner.name} logotyp`}
                      className="max-h-full w-auto object-contain"
                    />
                 ) : (
                    <span className="text-2xl font-bold text-slate-300">{partner.name}</span>
                 )}
              </div>

              {/* Textinnehåll */}
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {partner.name}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed mb-8">
                  {partner.description}
                </p>
              </div>

              {/* "LÄS MER" länk i botten */}
              <div className="mt-auto">
                <Link 
                  href={partner.href}
                  target="_blank"
                  className="group inline-flex items-center text-sm font-bold text-gray-900 hover:text-emerald-700 transition-colors"
                >
                  LÄS MER 
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};